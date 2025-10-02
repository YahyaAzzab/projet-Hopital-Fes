from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
import json

from users.models import User
from patients.models import Patient
from documents.models import Document
from documents.forms import DocumentForm
from reports.models import Report
from activities.models import Activity
from django.contrib.contenttypes.models import ContentType
from django.db.models import Count, Q
from datetime import datetime, timedelta
import json

def home_view(request):
    """Vue racine - redirection intelligente"""
    if request.user.is_authenticated:
        return redirect('dashboard')
    else:
        return redirect('login')

def clear_session_view(request):
    """Vue pour vider complètement la session"""
    request.session.flush()
    logout(request)
    return redirect('login')

@csrf_exempt
def login_view(request):
    """Vue de connexion"""
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('email')  # Le champ email est utilisé comme username
        password = request.POST.get('password')
        
        try:
            # Essayer d'abord par username
            user = User.objects.get(username=username)
            if user.check_password(password) and user.is_active:
                login(request, user)
                
                # Enregistrer l'activité de connexion
                Activity.objects.create(
                    user=user,
                    action='login',
                    description=f'Connexion de {user.get_full_name()}',
                    details={
                        'user_id': user.id,
                        'username': user.username,
                        'role': user.role,
                        'department': user.department
                    },
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    session_key=request.session.session_key
                )
                
                messages.success(request, f'Bienvenue, {user.get_full_name()}!')
                return redirect('dashboard')
            else:
                messages.error(request, 'Identifiants invalides')
        except User.DoesNotExist:
            try:
                # Essayer par email si pas trouvé par username
                user = User.objects.get(email=username)
                if user.check_password(password) and user.is_active:
                    login(request, user)
                    
                    # Enregistrer l'activité de connexion
                    Activity.objects.create(
                        user=user,
                        action='login',
                        description=f'Connexion de {user.get_full_name()}',
                        details={
                            'user_id': user.id,
                            'username': user.username,
                            'role': user.role,
                            'department': user.department
                        },
                        ip_address=request.META.get('REMOTE_ADDR'),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        session_key=request.session.session_key
                    )
                    
                    messages.success(request, f'Bienvenue, {user.get_full_name()}!')
                    return redirect('dashboard')
                else:
                    messages.error(request, 'Identifiants invalides')
            except User.DoesNotExist:
                messages.error(request, 'Utilisateur non trouvé')
    
    return render(request, 'medical/login.html')

@login_required
def logout_view(request):
    """Vue de déconnexion avec message personnalisé"""
    user_name = request.user.get_full_name() or request.user.username
    
    # Enregistrer l'activité de déconnexion
    Activity.objects.create(
        user=request.user,
        action='logout',
        description=f'Déconnexion de {user_name}',
        details={
            'user_id': request.user.id,
            'username': request.user.username,
            'role': request.user.role,
            'session_duration': 'N/A'  # Peut être calculé si nécessaire
        },
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        session_key=request.session.session_key
    )
    
    logout(request)
    messages.success(request, f'Au revoir {user_name}! Vous avez été déconnecté avec succès.')
    return redirect('login')

@login_required
def logout_confirm(request):
    """Page de confirmation de déconnexion"""
    # Calculer la durée de session
    session_start = request.session.get('session_start', None)
    if session_start:
        from datetime import datetime
        session_duration = (datetime.now() - datetime.fromisoformat(session_start)).total_seconds()
        hours = int(session_duration // 3600)
        minutes = int((session_duration % 3600) // 60)
        session_duration_str = f"{hours:02d}:{minutes:02d}"
    else:
        session_duration_str = "00:00"
        request.session['session_start'] = datetime.now().isoformat()
    
    context = {
        'user': request.user,
        'session_duration': session_duration_str,
        'last_activity': 'Maintenant'
    }
    
    return render(request, 'medical/logout_confirm.html', context)

@login_required
def dashboard(request):
    """Vue du tableau de bord"""
    context = {
        'user': request.user,
        'patients_count': Patient.objects.count(),
        'documents_count': Document.objects.count(),
        'reports_count': Report.objects.count(),
        'recent_activities': Activity.objects.all()[:5],
    }
    return render(request, 'medical/dashboard.html', context)

@login_required
def patients(request):
    """Vue des patients"""
    if request.method == 'POST':
        # Créer un nouveau patient
        print(f"DEBUG: Tentative de création de patient par {request.user}")
        print(f"DEBUG: Données POST: {dict(request.POST)}")
        
        try:
            # Validation des champs requis
            if not request.POST.get('first_name'):
                messages.error(request, 'Le prénom est requis')
                return redirect('patients')
            if not request.POST.get('last_name'):
                messages.error(request, 'Le nom est requis')
                return redirect('patients')
            if not request.POST.get('ci'):
                messages.error(request, 'La carte d\'identité est requise')
                return redirect('patients')
            if not request.POST.get('date_of_birth'):
                messages.error(request, 'La date de naissance est requise')
                return redirect('patients')
            if not request.POST.get('gender'):
                messages.error(request, 'Le genre est requis')
                return redirect('patients')
            if not request.POST.get('blood_type'):
                messages.error(request, 'Le groupe sanguin est requis pour la sécurité des patients')
                return redirect('patients')
            
            # Générer un ID patient unique
            import random
            import string
            from datetime import datetime
            
            year = datetime.now().year
            random_id = ''.join(random.choices(string.digits, k=4))
            patient_id = f"PAT{year}{random_id}"
            
            patient = Patient.objects.create(
                patient_id=patient_id,
                first_name=request.POST.get('first_name'),
                last_name=request.POST.get('last_name'),
                ci=request.POST.get('ci', ''),  # Carte d'identité
                date_of_birth=request.POST.get('date_of_birth'),
                gender=request.POST.get('gender'),
                phone=request.POST.get('phone_number', ''),  # Corriger le nom du champ
                email=request.POST.get('email', ''),
                address=request.POST.get('address', ''),
                city=request.POST.get('city', ''),
                blood_type=request.POST.get('blood_type', ''),
                emergency_contact=request.POST.get('emergency_contact', ''),
                insurance=request.POST.get('insurance_provider', ''),  # Corriger le nom du champ
                allergies=request.POST.get('allergies', ''),
                medical_history=request.POST.get('medical_history', ''),
                occupation=request.POST.get('occupation', ''),
                marital_status=request.POST.get('marital_status', ''),
                notes=request.POST.get('notes', ''),
                status='active',
                created_by=request.user
            )
            
            # Enregistrer l'activité
            Activity.objects.create(
                user=request.user,
                action='patient_created',
                description=f'Nouveau patient créé: {patient.get_full_name()} (ID: {patient.patient_id})',
                content_type=ContentType.objects.get_for_model(Patient),
                object_id=patient.id,
                details={
                    'patient_id': patient.patient_id,
                    'patient_name': patient.get_full_name(),
                    'blood_type': patient.blood_type,
                    'city': patient.city
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                session_key=request.session.session_key
            )
            
            print(f"DEBUG: Patient créé avec succès: {patient.id}")
            messages.success(request, f'Patient "{patient.first_name} {patient.last_name}" créé avec succès!')
            return redirect('patients')
        except Exception as e:
            print(f"DEBUG: Erreur lors de la création: {str(e)}")
            messages.error(request, f'Erreur lors de la création du patient: {str(e)}')
    
    patients_list = Patient.objects.all().order_by('-created_at')
    context = {
        'user': request.user,
        'patients': patients_list,
    }
    return render(request, 'medical/patients.html', context)

@login_required
def documents(request):
    """Vue des documents"""
    from patients.models import Patient
    
    if request.method == 'POST':
        # Créer un nouveau document
        try:
            patient = Patient.objects.get(id=request.POST.get('patient'))
            document = Document.objects.create(
                title=request.POST.get('title'),
                document_type=request.POST.get('document_type'),
                patient=patient,
                patient_name=patient.get_full_name(),
                document_date=request.POST.get('document_date'),
                file=request.FILES.get('file'),
                description=request.POST.get('description', ''),
                priority=request.POST.get('priority', 'medium'),
                status='pending',
                created_by=request.user
            )
            
            # Enregistrer l'activité
            Activity.objects.create(
                user=request.user,
                action='document_uploaded',
                description=f'Nouveau document téléchargé: {document.title} pour {patient.get_full_name()}',
                content_type=ContentType.objects.get_for_model(Document),
                object_id=document.id,
                details={
                    'document_title': document.title,
                    'document_type': document.document_type,
                    'patient_name': patient.get_full_name(),
                    'file_size': document.file.size if document.file else 0
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                session_key=request.session.session_key
            )
            
            print(f"DEBUG: Document créé avec succès: {document.id}")
            messages.success(request, f'Document "{document.title}" créé avec succès!')
            return redirect('documents')
        except Exception as e:
            print(f"DEBUG: Erreur lors de la création du document: {str(e)}")
            messages.error(request, f'Erreur lors de la création du document: {str(e)}')
    
    documents_list = Document.objects.all().order_by('-document_date')
    patients_list = Patient.objects.all().order_by('first_name', 'last_name')
    context = {
        'user': request.user,
        'documents': documents_list,
        'patients': patients_list,
    }
    return render(request, 'medical/documents.html', context)

@login_required
def reports(request):
    """Vue des rapports"""
    reports_list = Report.objects.all().order_by('-report_date')
    context = {
        'user': request.user,
        'reports': reports_list,
    }
    return render(request, 'medical/reports.html', context)

@login_required
def users(request):
    """Vue des utilisateurs"""
    # Accès restreint aux administrateurs uniquement
    if not request.user.is_staff or request.user.role != 'admin':
        messages.error(request, 'Accès non autorisé. Seuls les administrateurs peuvent accéder à cette section.')
        return redirect('dashboard')
    
    if request.method == 'POST':
        # Créer un nouvel utilisateur
        try:
            user = User.objects.create_user(
                username=request.POST.get('username'),
                email=request.POST.get('email'),
                password=request.POST.get('password'),
                first_name=request.POST.get('first_name'),
                last_name=request.POST.get('last_name'),
                role=request.POST.get('role', 'doctor'),
                department=request.POST.get('department', ''),
                is_staff=request.POST.get('role') == 'admin',
                is_active=True
            )
            messages.success(request, f'Utilisateur "{user.get_full_name()}" créé avec succès!')
            return redirect('users')
        except Exception as e:
            messages.error(request, f'Erreur lors de la création de l\'utilisateur: {str(e)}')
    
    users_list = User.objects.all().order_by('-date_joined')
    context = {
        'user': request.user,
        'users': users_list,
    }
    return render(request, 'medical/users.html', context)

@login_required
def settings(request):
    """Vue des paramètres"""
    # Accès restreint aux administrateurs uniquement
    if not request.user.is_staff or request.user.role != 'admin':
        messages.error(request, 'Accès non autorisé. Seuls les administrateurs peuvent accéder à cette section.')
        return redirect('dashboard')
    
    context = {
        'user': request.user,
    }
    return render(request, 'medical/settings.html', context)

@login_required
def scanner(request):
    """Vue du scanner QR code"""
    user = request.user
    user_role = user.role
    
    # Récupérer les patients récents pour affichage
    recent_patients = Patient.objects.order_by('-created_at')[:10]
    
    # Statistiques du scanner selon le rôle
    if user_role == 'admin':
        # Admin voit toutes les statistiques
        total_scans = 2  # Compte les rapports simulés affichés
        scans_today = 2  # Compte les rapports simulés d'aujourd'hui
    else:
        # Médecins et infirmiers voient leurs propres statistiques
        try:
            total_scans = Document.objects.filter(created_by=user).count()
            scans_today = Document.objects.filter(
                created_by=user,
                created_at__date=datetime.now().date()
            ).count()
        except:
            total_scans = 0
            scans_today = 0
    
    context = {
        'user': user,
        'user_role': user_role,
        'recent_patients': recent_patients,
        'total_scans': total_scans,
        'scans_today': scans_today,
    }
    return render(request, 'medical/scanner.html', context)

@login_required
def settings_view(request):
    """Vue des paramètres système"""
    user = request.user
    user_role = user.role
    
    # Vérifier les permissions
    if user_role not in ['admin', 'technician']:
        messages.error(request, 'Accès non autorisé. Seuls les administrateurs et techniciens peuvent accéder aux paramètres.')
        return redirect('dashboard')
    
    context = {
        'user': user,
        'user_role': user_role,
    }
    return render(request, 'medical/settings.html', context)

@login_required
def system_logs_view(request):
    """Vue des logs système pour le technicien"""
    user = request.user
    
    # Vérifier les permissions
    if user.role != 'technician':
        messages.error(request, 'Accès non autorisé. Seuls les techniciens peuvent accéder aux logs système.')
        return redirect('dashboard')
    
    # Données simulées des logs
    logs_data = [
        {
            'id': 1,
            'timestamp': '2025-10-02 01:15:30',
            'level': 'INFO',
            'component': 'Authentication',
            'message': 'Utilisateur connecté avec succès',
            'user': 'admin',
            'ip': '127.0.0.1'
        },
        {
            'id': 2,
            'timestamp': '2025-10-02 01:14:45',
            'level': 'WARNING',
            'component': 'Database',
            'message': 'Connexion à la base de données lente',
            'user': 'system',
            'ip': '127.0.0.1'
        },
        {
            'id': 3,
            'timestamp': '2025-10-02 01:13:20',
            'level': 'ERROR',
            'component': 'File Upload',
            'message': 'Échec du téléchargement de fichier',
            'user': 'medecin',
            'ip': '192.168.1.100'
        },
        {
            'id': 4,
            'timestamp': '2025-10-02 01:12:10',
            'level': 'INFO',
            'component': 'Backup',
            'message': 'Sauvegarde automatique terminée',
            'user': 'system',
            'ip': '127.0.0.1'
        },
        {
            'id': 5,
            'timestamp': '2025-10-02 01:11:55',
            'level': 'DEBUG',
            'component': 'API',
            'message': 'Requête API traitée en 150ms',
            'user': 'technician',
            'ip': '192.168.1.50'
        }
    ]
    
    context = {
        'user': user,
        'user_role': user.role,
        'logs': logs_data,
        'total_logs': len(logs_data),
        'error_count': len([log for log in logs_data if log['level'] == 'ERROR']),
        'warning_count': len([log for log in logs_data if log['level'] == 'WARNING']),
    }
    return render(request, 'medical/system_logs.html', context)

@login_required
def system_monitor_view(request):
    """Vue du monitoring système pour le technicien"""
    user = request.user
    
    # Vérifier les permissions
    if user.role != 'technician':
        messages.error(request, 'Accès non autorisé. Seuls les techniciens peuvent accéder au monitoring.')
        return redirect('dashboard')
    
    # Données simulées du monitoring
    system_stats = {
        'cpu_usage': 45,
        'memory_usage': 67,
        'disk_usage': 23,
        'network_usage': 12,
        'active_users': 8,
        'database_connections': 15,
        'uptime': '5 jours, 12 heures',
        'last_backup': '2025-10-02 00:00:00',
        'server_status': 'Online',
        'database_status': 'Healthy'
    }
    
    context = {
        'user': user,
        'user_role': user.role,
        'system_stats': system_stats,
    }
    return render(request, 'medical/system_monitor.html', context)

@login_required
def backup_restore_view(request):
    """Vue de sauvegarde et restauration pour le technicien"""
    user = request.user
    
    # Vérifier les permissions
    if user.role != 'technician':
        messages.error(request, 'Accès non autorisé. Seuls les techniciens peuvent gérer les sauvegardes.')
        return redirect('dashboard')
    
    # Données simulées des sauvegardes
    backups_data = [
        {
            'id': 1,
            'filename': 'backup_2025_10_02_00_00.sql',
            'size': '2.3 MB',
            'created_at': '2025-10-02 00:00:00',
            'type': 'Automatique',
            'status': 'Completed'
        },
        {
            'id': 2,
            'filename': 'backup_2025_10_01_00_00.sql',
            'size': '2.1 MB',
            'created_at': '2025-10-01 00:00:00',
            'type': 'Automatique',
            'status': 'Completed'
        },
        {
            'id': 3,
            'filename': 'backup_2025_09_30_manual.sql',
            'size': '1.9 MB',
            'created_at': '2025-09-30 15:30:00',
            'type': 'Manuelle',
            'status': 'Completed'
        }
    ]
    
    context = {
        'user': user,
        'user_role': user.role,
        'backups': backups_data,
        'total_backups': len(backups_data),
        'total_size': '6.3 MB',
    }
    return render(request, 'medical/backup_restore.html', context)

@login_required
def maintenance_view(request):
    """Vue de maintenance pour le technicien"""
    user = request.user
    
    # Vérifier les permissions
    if user.role != 'technician':
        messages.error(request, 'Accès non autorisé. Seuls les techniciens peuvent accéder à la maintenance.')
        return redirect('dashboard')
    
    # Données simulées de maintenance
    maintenance_tasks = [
        {
            'id': 1,
            'task': 'Nettoyage des fichiers temporaires',
            'last_run': '2025-10-01 23:59:00',
            'next_run': '2025-10-02 23:59:00',
            'status': 'Scheduled',
            'frequency': 'Quotidien'
        },
        {
            'id': 2,
            'task': 'Optimisation de la base de données',
            'last_run': '2025-09-30 02:00:00',
            'next_run': '2025-10-07 02:00:00',
            'status': 'Scheduled',
            'frequency': 'Hebdomadaire'
        },
        {
            'id': 3,
            'task': 'Vérification des mises à jour de sécurité',
            'last_run': '2025-10-01 12:00:00',
            'next_run': '2025-10-02 12:00:00',
            'status': 'Running',
            'frequency': 'Quotidien'
        }
    ]
    
    context = {
        'user': user,
        'user_role': user.role,
        'maintenance_tasks': maintenance_tasks,
        'total_tasks': len(maintenance_tasks),
        'running_tasks': len([task for task in maintenance_tasks if task['status'] == 'Running']),
    }
    return render(request, 'medical/maintenance.html', context)

@login_required
def scan_result(request):
    """Traitement du résultat du scan"""
    if request.method == 'POST':
        qr_data = request.POST.get('qr_data', '')
        
        # Traitement du QR code selon le format
        result = process_qr_code(qr_data)
        
        return JsonResponse(result)
    
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

def process_qr_code(qr_data):
    """Traite les données du QR code"""
    try:
        # Si c'est un ID de patient
        if qr_data.isdigit():
            patient_id = int(qr_data)
            try:
                patient = Patient.objects.get(id=patient_id)
                return {
                    'success': True,
                    'type': 'patient',
                    'data': {
                        'id': patient.id,
                        'name': patient.get_full_name(),
                        'ci': patient.ci,
                        'phone': patient.phone,
                        'status': patient.status,
                        'url': f'/patients/{patient.id}/'
                    }
                }
            except Patient.DoesNotExist:
                return {
                    'success': False,
                    'error': 'Patient non trouvé'
                }
        
        # Si c'est un QR code personnalisé (format: TYPE:ID)
        elif ':' in qr_data:
            parts = qr_data.split(':')
            if len(parts) == 2:
                qr_type, qr_id = parts
                
                if qr_type == 'PATIENT' and qr_id.isdigit():
                    try:
                        patient = Patient.objects.get(id=int(qr_id))
                        return {
                            'success': True,
                            'type': 'patient',
                            'data': {
                                'id': patient.id,
                                'name': patient.get_full_name(),
                                'ci': patient.ci,
                                'phone': patient.phone,
                                'status': patient.status,
                                'url': f'/patients/{patient.id}/'
                            }
                        }
                    except Patient.DoesNotExist:
                        return {
                            'success': False,
                            'error': 'Patient non trouvé'
                        }
                
                elif qr_type == 'REPORT' and qr_id.isdigit():
                    try:
                        report = Report.objects.get(id=int(qr_id))
                        return {
                            'success': True,
                            'type': 'report',
                            'data': {
                                'id': report.id,
                                'title': report.title,
                                'patient_name': report.patient.get_full_name() if report.patient else 'N/A',
                                'type': report.report_type,
                                'status': report.status,
                                'url': f'/reports/{report.id}/'
                            }
                        }
                    except Report.DoesNotExist:
                        return {
                            'success': False,
                            'error': 'Rapport non trouvé'
                        }
        
        # Si c'est une URL ou autre format
        else:
            return {
                'success': False,
                'error': 'Format de QR code non reconnu'
            }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erreur lors du traitement: {str(e)}'
        }

# Vues CRUD pour les patients
@login_required
def view_patient(request, patient_id):
    """Voir un patient"""
    patient = get_object_or_404(Patient, id=patient_id)
    context = {
        'user': request.user,
        'patient': patient,
    }
    return render(request, 'medical/patient_detail.html', context)

@login_required
def edit_patient(request, patient_id):
    """Modifier un patient"""
    patient = get_object_or_404(Patient, id=patient_id)
    
    if request.method == 'POST':
        try:
            patient.first_name = request.POST.get('first_name', patient.first_name)
            patient.last_name = request.POST.get('last_name', patient.last_name)
            patient.date_of_birth = request.POST.get('date_of_birth', patient.date_of_birth)
            patient.gender = request.POST.get('gender', patient.gender)
            patient.phone_number = request.POST.get('phone_number', patient.phone_number)
            patient.email = request.POST.get('email', patient.email)
            patient.address = request.POST.get('address', patient.address)
            patient.city = request.POST.get('city', patient.city)
            patient.blood_type = request.POST.get('blood_type', patient.blood_type)
            patient.emergency_contact = request.POST.get('emergency_contact', patient.emergency_contact)
            patient.insurance_provider = request.POST.get('insurance_provider', patient.insurance_provider)
            patient.allergies = request.POST.get('allergies', patient.allergies)
            patient.medical_history = request.POST.get('medical_history', patient.medical_history)
            patient.occupation = request.POST.get('occupation', patient.occupation)
            patient.marital_status = request.POST.get('marital_status', patient.marital_status)
            patient.notes = request.POST.get('notes', patient.notes)
            patient.status = request.POST.get('status', patient.status)
            patient.save()
            
            messages.success(request, f'Patient "{patient.first_name} {patient.last_name}" modifié avec succès!')
            return redirect('patients')
        except Exception as e:
            messages.error(request, f'Erreur lors de la modification du patient: {str(e)}')
    
    context = {
        'user': request.user,
        'patient': patient,
    }
    return render(request, 'medical/patient_edit.html', context)

@login_required
def delete_patient(request, patient_id):
    """Supprimer un patient"""
    # Vérifier les permissions - les infirmiers ne peuvent pas supprimer
    if request.user.role == 'nurse':
        messages.error(request, 'Accès refusé. Les infirmiers ne peuvent pas supprimer les patients.')
        return redirect('patients')
    
    patient = get_object_or_404(Patient, id=patient_id)
    
    if request.method == 'POST':
        try:
            patient_name = f"{patient.first_name} {patient.last_name}"
            patient.delete()
            messages.success(request, f'Patient "{patient_name}" supprimé avec succès!')
            return redirect('patients')
        except Exception as e:
            messages.error(request, f'Erreur lors de la suppression du patient: {str(e)}')
            return redirect('patients')
    
    # Afficher la page de confirmation
    context = {
        'patient': patient,
    }
    return render(request, 'medical/patient_confirm_delete.html', context)

# Vues CRUD pour les utilisateurs
@login_required
def view_user(request, user_id):
    """Voir un utilisateur"""
    if not request.user.is_staff:
        messages.error(request, 'Accès non autorisé')
        return redirect('dashboard')
    
    user = get_object_or_404(User, id=user_id)
    context = {
        'user': request.user,
        'viewed_user': user,
    }
    return render(request, 'medical/user_detail.html', context)

@login_required
def edit_user(request, user_id):
    """Modifier un utilisateur"""
    if not request.user.is_staff:
        messages.error(request, 'Accès non autorisé')
        return redirect('dashboard')
    
    user = get_object_or_404(User, id=user_id)
    
    if request.method == 'POST':
        try:
            user.first_name = request.POST.get('first_name', user.first_name)
            user.last_name = request.POST.get('last_name', user.last_name)
            user.email = request.POST.get('email', user.email)
            user.role = request.POST.get('role', user.role)
            user.department = request.POST.get('department', user.department)
            user.is_active = request.POST.get('is_active') == 'on'
            user.is_staff = request.POST.get('role') == 'admin'
            
            # Changer le mot de passe si fourni
            new_password = request.POST.get('password')
            if new_password:
                user.set_password(new_password)
            
            user.save()
            
            messages.success(request, f'Utilisateur "{user.get_full_name()}" modifié avec succès!')
            return redirect('users')
        except Exception as e:
            messages.error(request, f'Erreur lors de la modification de l\'utilisateur: {str(e)}')
    
    context = {
        'user': request.user,
        'edited_user': user,
    }
    return render(request, 'medical/user_edit.html', context)

@login_required
def delete_user(request, user_id):
    """Supprimer un utilisateur"""
    if not request.user.is_staff:
        messages.error(request, 'Accès non autorisé')
        return redirect('dashboard')
    
    user = get_object_or_404(User, id=user_id)
    
    if request.method == 'POST':
        try:
            user_name = user.get_full_name()
            user.delete()
            messages.success(request, f'Utilisateur "{user_name}" supprimé avec succès!')
        except Exception as e:
            messages.error(request, f'Erreur lors de la suppression de l\'utilisateur: {str(e)}')
    
    return redirect('users')

@login_required
def dashboard_view(request):
    """Vue du dashboard avec statistiques en temps réel"""
    user = request.user
    user_role = user.role
    
    # Statistiques générales - Filtrage selon le rôle
    if user_role == 'admin':
        # Admin voit tout
        total_patients = Patient.objects.count()
        total_reports = Report.objects.count()
        total_users = User.objects.count()
        total_documents = Document.objects.count() if hasattr(Document, 'objects') else 0
    elif user_role == 'doctor':
        # Médecin voit ses patients et rapports
        total_patients = Patient.objects.filter(created_by=user).count()
        total_reports = Report.objects.filter(created_by=user).count()
        total_users = 0  # Médecin ne voit pas les statistiques utilisateurs
        total_documents = Document.objects.filter(created_by=user).count() if hasattr(Document, 'objects') else 0
    elif user_role == 'nurse':
        # Infirmier voit les patients assignés
        total_patients = Patient.objects.filter(created_by=user).count()
        total_reports = Report.objects.filter(created_by=user).count()
        total_users = 0
        total_documents = Document.objects.filter(created_by=user).count() if hasattr(Document, 'objects') else 0
    elif user_role == 'technician':
        # Technicien - accès limité aux paramètres et messages uniquement
        total_patients = 0
        total_reports = 0
        total_users = 0
        total_documents = 0
    else:
        # Autres rôles - accès limité
        total_patients = 0
        total_reports = 0
        total_users = 0
        total_documents = 0
    
    # Statistiques des 30 derniers jours - Filtrage selon le rôle
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    if user_role == 'admin':
        patients_this_month = Patient.objects.filter(created_at__gte=thirty_days_ago).count()
        reports_this_month = Report.objects.filter(created_at__gte=thirty_days_ago).count()
    elif user_role == 'doctor':
        patients_this_month = Patient.objects.filter(created_by=user, created_at__gte=thirty_days_ago).count()
        reports_this_month = Report.objects.filter(created_by=user, created_at__gte=thirty_days_ago).count()
    elif user_role == 'nurse':
        patients_this_month = Patient.objects.filter(created_by=user, created_at__gte=thirty_days_ago).count()
        reports_this_month = Report.objects.filter(created_by=user, created_at__gte=thirty_days_ago).count()
    else:
        patients_this_month = 0
        reports_this_month = 0
    
    # Patients par statut - Filtrage selon le rôle
    if user_role == 'admin':
        patients_by_status = Patient.objects.values('status').annotate(count=Count('id'))
        reports_by_type = Report.objects.values('report_type').annotate(count=Count('id'))
        reports_by_priority = Report.objects.values('priority').annotate(count=Count('id'))
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
    elif user_role == 'doctor':
        patients_by_status = Patient.objects.filter(created_by=user).values('status').annotate(count=Count('id'))
        reports_by_type = Report.objects.filter(created_by=user).values('report_type').annotate(count=Count('id'))
        reports_by_priority = Report.objects.filter(created_by=user).values('priority').annotate(count=Count('id'))
        active_users = 0
        inactive_users = 0
    elif user_role == 'nurse':
        patients_by_status = Patient.objects.filter(created_by=user).values('status').annotate(count=Count('id'))
        reports_by_type = Report.objects.filter(created_by=user).values('report_type').annotate(count=Count('id'))
        reports_by_priority = Report.objects.filter(created_by=user).values('priority').annotate(count=Count('id'))
        active_users = 0
        inactive_users = 0
    else:
        patients_by_status = []
        reports_by_type = []
        reports_by_priority = []
        active_users = 0
        inactive_users = 0
    
    # Données pour les graphiques temporels (7 derniers jours)
    last_7_days = []
    patients_chart_data = []
    reports_chart_data = []
    
    for i in range(7):
        date = datetime.now() - timedelta(days=6-i)
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        patients_count = Patient.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count()
        reports_count = Report.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count()
        
        last_7_days.append(date.strftime('%d/%m'))
        patients_chart_data.append(patients_count)
        reports_chart_data.append(reports_count)
    
    # Rapports urgents
    urgent_reports = Report.objects.filter(priority='urgent').count()
    
    # Patients récents
    recent_patients = Patient.objects.order_by('-created_at')[:5]
    
    # Rapports récents
    recent_reports = Report.objects.order_by('-created_at')[:5]
    
    context = {
        'user': user,
        'user_role': user_role,
        'total_patients': total_patients,
        'total_reports': total_reports,
        'total_users': total_users,
        'total_documents': total_documents,
        'patients_this_month': patients_this_month,
        'reports_this_month': reports_this_month,
        'patients_by_status': list(patients_by_status),
        'reports_by_type': list(reports_by_type),
        'reports_by_priority': list(reports_by_priority),
        'active_users': active_users,
        'inactive_users': inactive_users,
        'last_7_days': json.dumps(last_7_days),
        'patients_chart_data': json.dumps(patients_chart_data),
        'reports_chart_data': json.dumps(reports_chart_data),
        'urgent_reports': urgent_reports,
        'recent_patients': recent_patients,
        'recent_reports': recent_reports,
    }
    
    return render(request, 'medical/dashboard.html', context)

@login_required
def dashboard_api(request):
    """API pour les données du dashboard en temps réel"""
    # Statistiques générales
    total_patients = Patient.objects.count()
    total_reports = Report.objects.count()
    total_users = User.objects.count()
    
    # Données pour les graphiques temporels (24 dernières heures)
    last_24_hours = []
    patients_hourly = []
    reports_hourly = []
    
    for i in range(24):
        hour = datetime.now() - timedelta(hours=23-i)
        hour_start = hour.replace(minute=0, second=0, microsecond=0)
        hour_end = hour_start + timedelta(hours=1)
        
        patients_count = Patient.objects.filter(created_at__gte=hour_start, created_at__lt=hour_end).count()
        reports_count = Report.objects.filter(created_at__gte=hour_start, created_at__lt=hour_end).count()
        
        last_24_hours.append(hour.strftime('%H:%M'))
        patients_hourly.append(patients_count)
        reports_hourly.append(reports_count)
    
    # Rapports urgents
    urgent_reports = Report.objects.filter(priority='urgent').count()
    
    data = {
        'total_patients': total_patients,
        'total_reports': total_reports,
        'total_users': total_users,
        'urgent_reports': urgent_reports,
        'last_24_hours': last_24_hours,
        'patients_hourly': patients_hourly,
        'reports_hourly': reports_hourly,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return JsonResponse(data)

@login_required
def notifications_api(request):
    """API pour récupérer les notifications récentes"""
    from django.utils import timezone
    
    # Récupérer les activités des dernières 24 heures
    last_24_hours = timezone.now() - timedelta(hours=24)
    last_hour = timezone.now() - timedelta(hours=1)
    
    # Récupérer toutes les activités récentes
    all_activities = Activity.objects.filter(
        created_at__gte=last_24_hours
    ).order_by('-created_at')
    
    # Prendre les 20 plus récentes
    activities = all_activities[:20]
    
    # Compter les activités non lues (dernière heure)
    unread_count = all_activities.filter(created_at__gte=last_hour).count()
    
    notifications = []
    for activity in activities:
        try:
            notifications.append({
                'id': activity.id,
                'action': activity.action,
                'action_display': activity.get_action_display(),
                'description': activity.description,
                'user': activity.user.get_full_name() if activity.user else 'Système',
                'created_at': activity.created_at.strftime('%d/%m/%Y %H:%M'),
                'severity': activity.severity,
                'severity_color': activity.get_severity_display_color(),
                'action_color': activity.get_action_display_color(),
                'is_recent': activity.is_recent(minutes=30),
                'details': activity.details
            })
        except Exception as e:
            # En cas d'erreur sur une activité, on l'ignore
            continue
    
    return JsonResponse({
        'notifications': notifications,
        'total_count': all_activities.count(),
        'unread_count': unread_count
    })

# Vues CRUD pour les documents
@login_required
def view_document(request, document_id):
    """Voir un document"""
    try:
        document = Document.objects.get(id=document_id)
        context = {
            'document': document,
        }
        return render(request, 'medical/document_detail.html', context)
    except Document.DoesNotExist:
        messages.error(request, 'Document non trouvé.')
        return redirect('documents')

@login_required
def edit_document(request, document_id):
    """Modifier un document"""
    try:
        document = Document.objects.get(id=document_id)
        if request.method == 'POST':
            form = DocumentForm(request.POST, request.FILES, instance=document)
            if form.is_valid():
                document = form.save(commit=False)
                if document.patient:
                    document.patient_name = document.patient.get_full_name()
                document.save()
                messages.success(request, 'Document modifié avec succès!')
                return redirect('view_document', document_id=document.id)
        else:
            form = DocumentForm(instance=document)
        
        context = {
            'form': form,
            'document': document,
        }
        return render(request, 'medical/document_edit.html', context)
    except Document.DoesNotExist:
        messages.error(request, 'Document non trouvé.')
        return redirect('documents')

@login_required
def delete_document(request, document_id):
    """Supprimer un document"""
    # Vérifier les permissions - les infirmiers ne peuvent pas supprimer
    if request.user.role == 'nurse':
        messages.error(request, 'Accès refusé. Les infirmiers ne peuvent pas supprimer les documents.')
        return redirect('documents')
    
    try:
        document = Document.objects.get(id=document_id)
        if request.method == 'POST':
            document.delete()
            messages.success(request, 'Document supprimé avec succès!')
            return redirect('documents')
        
        context = {
            'document': document,
        }
        return render(request, 'medical/document_confirm_delete.html', context)
    except Document.DoesNotExist:
        messages.error(request, 'Document non trouvé.')
        return redirect('documents')

@login_required
def profile(request):
    """Vue du profil utilisateur"""
    user = request.user
    
    # Statistiques de l'utilisateur
    user_stats = {
        'patients_created': Patient.objects.filter(created_by=user).count(),
        'documents_created': Document.objects.filter(created_by=user).count(),
        'reports_created': Report.objects.filter(created_by=user).count(),
        'last_login': user.last_login,
        'date_joined': user.date_joined,
    }
    
    # Activités récentes (dernières 30 jours)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_patients = Patient.objects.filter(created_by=user, created_at__gte=thirty_days_ago).order_by('-created_at')[:5]
    recent_documents = Document.objects.filter(created_by=user, created_at__gte=thirty_days_ago).order_by('-created_at')[:5]
    recent_reports = Report.objects.filter(created_by=user, created_at__gte=thirty_days_ago).order_by('-created_at')[:5]
    
    context = {
        'user': user,
        'user_stats': user_stats,
        'recent_patients': recent_patients,
        'recent_documents': recent_documents,
        'recent_reports': recent_reports,
    }
    
    return render(request, 'medical/profile.html', context)

@login_required
def activities_view(request):
    """Vue des activités pour infirmiers"""
    user = request.user
    user_role = user.role
    
    # Vérifier que l'utilisateur est infirmier
    if user_role != 'nurse':
        messages.error(request, 'Accès non autorisé. Seuls les infirmiers peuvent accéder aux activités.')
        return redirect('dashboard')
    
    # Données simulées pour les activités infirmiers
    activities_data = [
        {
            'id': 1,
            'type': 'Soins',
            'title': 'Administration de médicaments - Chambre 201',
            'patient': 'Marie Dubois',
            'time': '14:30',
            'status': 'completed',
            'priority': 'normal',
            'description': 'Administration des médicaments prescrits pour le traitement de l\'hypertension'
        },
        {
            'id': 2,
            'type': 'Surveillance',
            'title': 'Contrôle des signes vitaux - Chambre 205',
            'patient': 'Jean Martin',
            'time': '15:00',
            'status': 'pending',
            'priority': 'high',
            'description': 'Contrôle de la tension artérielle et de la température'
        },
        {
            'id': 3,
            'type': 'Soins',
            'title': 'Pansement - Chambre 203',
            'patient': 'Sophie Laurent',
            'time': '15:30',
            'status': 'in_progress',
            'priority': 'urgent',
            'description': 'Changement de pansement pour plaie post-opératoire'
        },
        {
            'id': 4,
            'type': 'Surveillance',
            'title': 'Surveillance continue - Chambre 208',
            'patient': 'Pierre Durand',
            'time': '16:00',
            'status': 'pending',
            'priority': 'high',
            'description': 'Surveillance des paramètres cardiaques'
        },
        {
            'id': 5,
            'type': 'Soins',
            'title': 'Préparation pour examen - Chambre 210',
            'patient': 'Claire Moreau',
            'time': '16:30',
            'status': 'pending',
            'priority': 'normal',
            'description': 'Préparation du patient pour échographie abdominale'
        }
    ]
    
    # Statistiques des activités
    stats = {
        'total_activities': len(activities_data),
        'completed': len([a for a in activities_data if a['status'] == 'completed']),
        'pending': len([a for a in activities_data if a['status'] == 'pending']),
        'in_progress': len([a for a in activities_data if a['status'] == 'in_progress']),
        'urgent': len([a for a in activities_data if a['priority'] == 'urgent']),
    }
    
    context = {
        'user': user,
        'user_role': user_role,
        'activities': activities_data,
        'stats': stats,
    }
    
    return render(request, 'medical/activities.html', context)
