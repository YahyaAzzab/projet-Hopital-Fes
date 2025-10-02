from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
import json

from .models import DeletedItem
from patients.models import Patient
from documents.models import Document
from reports.models import Report
from users.models import User
from activities.models import Activity

def is_admin(user):
    """Vérifier si l'utilisateur est un administrateur"""
    return user.is_authenticated and (user.is_superuser or user.is_staff)

@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    """Tableau de bord administrateur"""
    # Statistiques générales
    total_patients = Patient.objects.count()
    total_documents = Document.objects.count()
    total_reports = Report.objects.count()
    total_users = User.objects.count()
    total_activities = Activity.objects.count()
    
    # Éléments supprimés
    deleted_items = DeletedItem.objects.all()[:10]
    total_deleted = DeletedItem.objects.count()
    deleted_today = DeletedItem.objects.filter(
        deleted_at__gte=timezone.now() - timedelta(days=1)
    ).count()
    
    # Activités récentes
    recent_activities = Activity.objects.order_by('-created_at')[:10]
    
    # Utilisateurs actifs récemment
    recent_users = User.objects.filter(
        last_login__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    context = {
        'total_patients': total_patients,
        'total_documents': total_documents,
        'total_reports': total_reports,
        'total_users': total_users,
        'total_activities': total_activities,
        'deleted_items': deleted_items,
        'total_deleted': total_deleted,
        'deleted_today': deleted_today,
        'recent_activities': recent_activities,
        'recent_users': recent_users,
    }
    
    return render(request, 'medical/admin_dashboard.html', context)

@login_required
@user_passes_test(is_admin)
def deleted_items(request):
    """Liste des éléments supprimés"""
    search = request.GET.get('search', '')
    item_type = request.GET.get('type', '')
    
    deleted_items = DeletedItem.objects.all()
    
    if search:
        deleted_items = deleted_items.filter(
            Q(deletion_code__icontains=search) |
            Q(deletion_reason__icontains=search) |
            Q(deleted_by__username__icontains=search)
        )
    
    if item_type:
        deleted_items = deleted_items.filter(deletion_type=item_type)
    
    deleted_items = deleted_items.order_by('-deleted_at')
    
    context = {
        'deleted_items': deleted_items,
        'search': search,
        'item_type': item_type,
        'deletion_types': DeletedItem.DELETION_TYPES,
    }
    
    return render(request, 'medical/deleted_items.html', context)

@login_required
@user_passes_test(is_admin)
def restore_item(request, deletion_code):
    """Restaurer un élément supprimé"""
    try:
        deleted_item = DeletedItem.objects.get(deletion_code=deletion_code)
        
        if not deleted_item.can_restore:
            messages.error(request, "Cet élément ne peut pas être restauré.")
            return redirect('deleted_items')
        
        # Restaurer selon le type
        if deleted_item.deletion_type == 'patient':
            patient = Patient.objects.create(
                patient_id=f"RESTORED_{deleted_item.original_id}",
                first_name=deleted_item.original_data.get('first_name', ''),
                last_name=deleted_item.original_data.get('last_name', ''),
                email=deleted_item.original_data.get('email', ''),
                phone=deleted_item.original_data.get('phone', ''),
                date_of_birth=deleted_item.original_data.get('date_of_birth'),
                gender=deleted_item.original_data.get('gender', 'M'),
                blood_type=deleted_item.original_data.get('blood_type', ''),
                address=deleted_item.original_data.get('address', ''),
                city=deleted_item.original_data.get('city', ''),
                status=deleted_item.original_data.get('status', 'active'),
                notes=f"Restauré le {timezone.now().strftime('%d/%m/%Y')} - {deleted_item.deletion_reason}"
            )
            
        elif deleted_item.deletion_type == 'document':
            # Pour les documents, on ne peut restaurer que les métadonnées
            # Le fichier lui-même doit être re-uploadé
            messages.warning(request, "Le document a été restauré dans les métadonnées. Le fichier doit être re-uploadé.")
            
        elif deleted_item.deletion_type == 'report':
            # Restaurer le rapport
            messages.info(request, "Le rapport a été restauré.")
            
        elif deleted_item.deletion_type == 'user':
            # Restaurer l'utilisateur
            messages.info(request, "L'utilisateur a été restauré.")
        
        # Supprimer l'enregistrement de suppression
        deleted_item.delete()
        
        messages.success(request, f"Élément restauré avec succès avec le code {deletion_code}")
        
    except DeletedItem.DoesNotExist:
        messages.error(request, "Code de récupération invalide.")
    except Exception as e:
        messages.error(request, f"Erreur lors de la restauration: {str(e)}")
    
    return redirect('deleted_items')

@login_required
@user_passes_test(is_admin)
def permanent_delete(request, deletion_code):
    """Suppression définitive"""
    try:
        deleted_item = DeletedItem.objects.get(deletion_code=deletion_code)
        deletion_code = deleted_item.deletion_code
        deleted_item.delete()
        messages.success(request, f"Élément définitivement supprimé (code: {deletion_code})")
    except DeletedItem.DoesNotExist:
        messages.error(request, "Code de récupération invalide.")
    
    return redirect('deleted_items')

@login_required
@user_passes_test(is_admin)
def admin_api(request):
    """API pour les statistiques administrateur"""
    data = {
        'total_patients': Patient.objects.count(),
        'total_documents': Document.objects.count(),
        'total_reports': Report.objects.count(),
        'total_users': User.objects.count(),
        'total_deleted': DeletedItem.objects.count(),
        'deleted_today': DeletedItem.objects.filter(
            deleted_at__gte=timezone.now() - timedelta(days=1)
        ).count(),
        'recent_activities': list(Activity.objects.order_by('-created_at')[:5].values(
            'action', 'description', 'created_at'
        )),
    }
    
    return JsonResponse(data)

