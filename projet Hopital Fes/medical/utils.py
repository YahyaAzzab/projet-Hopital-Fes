from .models import DeletedItem
from django.contrib.auth import get_user_model

User = get_user_model()

def soft_delete_object(obj, user, reason=""):
    """
    Supprime doucement un objet et crée un enregistrement de suppression
    """
    try:
        # Créer l'enregistrement de suppression
        deletion_record = DeletedItem.create_deletion_record(obj, user, reason)
        
        # Supprimer l'objet de la base de données
        obj.delete()
        
        return deletion_record
    except Exception as e:
        print(f"Erreur lors de la suppression douce: {e}")
        return None

def restore_object(deletion_code):
    """
    Restaure un objet supprimé à partir de son code de suppression
    """
    try:
        deleted_item = DeletedItem.objects.get(deletion_code=deletion_code)
        
        if not deleted_item.can_restore:
            return None, "Cet élément ne peut pas être restauré"
        
        # Restaurer selon le type
        if deleted_item.deletion_type == 'patient':
            from patients.models import Patient
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
                notes=f"Restauré le {deleted_item.deleted_at.strftime('%d/%m/%Y')} - {deleted_item.deletion_reason}"
            )
            deleted_item.delete()
            return patient, "Patient restauré avec succès"
            
        elif deleted_item.deletion_type == 'document':
            from documents.models import Document
            # Pour les documents, on ne peut restaurer que les métadonnées
            document = Document.objects.create(
                title=deleted_item.original_data.get('title', 'Document restauré'),
                document_type=deleted_item.original_data.get('document_type', 'other'),
                description=f"Document restauré - {deleted_item.deletion_reason}",
                priority=deleted_item.original_data.get('priority', 'medium'),
                status=deleted_item.original_data.get('status', 'pending')
            )
            deleted_item.delete()
            return document, "Document restauré (fichier à re-uploader)"
            
        elif deleted_item.deletion_type == 'report':
            from reports.models import Report
            report = Report.objects.create(
                title=deleted_item.original_data.get('title', 'Rapport restauré'),
                report_type=deleted_item.original_data.get('report_type', 'consultation'),
                summary=f"Rapport restauré - {deleted_item.deletion_reason}",
                priority=deleted_item.original_data.get('priority', 'medium'),
                status=deleted_item.original_data.get('status', 'draft')
            )
            deleted_item.delete()
            return report, "Rapport restauré avec succès"
            
        elif deleted_item.deletion_type == 'user':
            # Pour les utilisateurs, on ne peut pas les restaurer automatiquement
            # car cela pourrait créer des problèmes de sécurité
            return None, "Les utilisateurs ne peuvent pas être restaurés automatiquement"
        
        else:
            return None, "Type d'élément non supporté pour la restauration"
            
    except DeletedItem.DoesNotExist:
        return None, "Code de récupération invalide"
    except Exception as e:
        return None, f"Erreur lors de la restauration: {str(e)}"

