from django import template

register = template.Library()

@register.filter
def status_badge_class(status):
    """Retourne la classe CSS appropriée pour le badge de statut"""
    if status == 'active':
        return 'bg-success'
    elif status == 'inactive':
        return 'bg-secondary'
    elif status == 'pending':
        return 'bg-warning'
    elif status == 'archived':
        return 'bg-info'
    else:
        return 'bg-secondary'

@register.filter
def priority_badge_class(priority):
    """Retourne la classe CSS appropriée pour le badge de priorité"""
    if priority == 'high' or priority == 'urgent':
        return 'bg-danger'
    elif priority == 'medium':
        return 'bg-warning'
    elif priority == 'low':
        return 'bg-success'
    else:
        return 'bg-secondary'

@register.filter
def action_badge_class(action):
    """Retourne la classe CSS appropriée pour le badge d'action"""
    if action in ['login', 'logout']:
        return 'bg-info'
    elif action in ['patient_created', 'document_created', 'report_created']:
        return 'bg-success'
    elif action in ['patient_updated', 'document_updated', 'report_updated']:
        return 'bg-warning'
    elif action in ['patient_deleted', 'document_deleted', 'report_deleted']:
        return 'bg-danger'
    else:
        return 'bg-secondary'
