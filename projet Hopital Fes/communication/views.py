from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
import json

from users.models import User
from .models import Message, MessageThread, Notification


@login_required
def messages_list(request):
    """Liste des messages de l'utilisateur connecté"""
    # Messages reçus
    received_messages = Message.objects.filter(recipient=request.user).order_by('-created_at')
    
    # Messages envoyés
    sent_messages = Message.objects.filter(sender=request.user).order_by('-created_at')
    
    # Pagination
    received_paginator = Paginator(received_messages, 10)
    received_page = request.GET.get('received_page')
    received_messages = received_paginator.get_page(received_page)
    
    sent_paginator = Paginator(sent_messages, 10)
    sent_page = request.GET.get('sent_page')
    sent_messages = sent_paginator.get_page(sent_page)
    
    # Compter les messages non lus
    unread_count = Message.objects.filter(recipient=request.user, status='unread').count()
    
    context = {
        'received_messages': received_messages,
        'sent_messages': sent_messages,
        'unread_count': unread_count,
    }
    return render(request, 'communication/messages_list.html', context)


@login_required
def compose_message(request):
    """Composer un nouveau message"""
    if request.method == 'POST':
        try:
            # Récupérer les données du formulaire
            recipient_id = request.POST.get('recipient')
            title = request.POST.get('title')
            content = request.POST.get('content')
            priority = request.POST.get('priority', 'normal')
            category = request.POST.get('category', 'general')
            
            # Validation
            if not recipient_id or not title or not content:
                messages.error(request, 'Veuillez remplir tous les champs obligatoires.')
                return redirect('compose_message')
            
            # Récupérer le destinataire
            recipient = get_object_or_404(User, id=recipient_id)
            
            # Créer le message
            message = Message.objects.create(
                sender=request.user,
                recipient=recipient,
                title=title,
                content=content,
                priority=priority,
                category=category
            )
            
            # Créer une notification pour le destinataire
            Notification.objects.create(
                user=recipient,
                title=f"Nouveau message de {request.user.get_full_name()}",
                message=f"Vous avez reçu un nouveau message: {title}",
                notification_type='message',
                message_link=message
            )
            
            messages.success(request, f'Message envoyé à {recipient.get_full_name()} avec succès!')
            return redirect('messages')
            
        except Exception as e:
            messages.error(request, f'Erreur lors de l\'envoi du message: {str(e)}')
    
    # Obtenir la liste des utilisateurs disponibles
    users = User.objects.filter(is_active=True).exclude(id=request.user.id)
    
    context = {
        'users': users,
    }
    return render(request, 'communication/compose_message.html', context)


@login_required
def message_detail(request, message_id):
    """Détail d'un message"""
    message = get_object_or_404(Message, id=message_id)
    
    # Vérifier que l'utilisateur a le droit de voir ce message
    if message.sender != request.user and message.recipient != request.user:
        messages.error(request, 'Accès non autorisé.')
        return redirect('messages')
    
    # Marquer comme lu si c'est le destinataire
    if message.recipient == request.user and message.status == 'unread':
        message.mark_as_read()
    
    # Messages liés (réponses)
    related_messages = Message.objects.filter(
        Q(sender=message.sender, recipient=message.recipient) |
        Q(sender=message.recipient, recipient=message.sender)
    ).exclude(id=message_id).order_by('created_at')
    
    context = {
        'message': message,
        'related_messages': related_messages,
    }
    return render(request, 'communication/message_detail.html', context)


@login_required
def reply_message(request, message_id):
    """Répondre à un message"""
    original_message = get_object_or_404(Message, id=message_id)
    
    if request.method == 'POST':
        try:
            content = request.POST.get('content')
            if not content:
                messages.error(request, 'Le contenu de la réponse ne peut pas être vide.')
                return redirect('message_detail', message_id=message_id)
            
            # Créer la réponse
            reply = Message.objects.create(
                sender=request.user,
                recipient=original_message.sender if request.user == original_message.recipient else original_message.recipient,
                title=f"Re: {original_message.title}",
                content=content,
                priority=original_message.priority,
                category=original_message.category
            )
            
            # Créer une notification
            Notification.objects.create(
                user=reply.recipient,
                title=f"Réponse de {request.user.get_full_name()}",
                message=f"Vous avez reçu une réponse à votre message: {original_message.title}",
                notification_type='message',
                message_link=reply
            )
            
            messages.success(request, 'Réponse envoyée avec succès!')
            return redirect('message_detail', message_id=message_id)
            
        except Exception as e:
            messages.error(request, f'Erreur lors de l\'envoi de la réponse: {str(e)}')
    
    context = {
        'original_message': original_message,
    }
    return render(request, 'communication/reply_message.html', context)


@login_required
def delete_message(request, message_id):
    """Supprimer un message"""
    message = get_object_or_404(Message, id=message_id)
    
    # Vérifier que l'utilisateur a le droit de supprimer ce message
    if message.sender != request.user and message.recipient != request.user:
        messages.error(request, 'Accès non autorisé.')
        return redirect('messages')
    
    message.delete()
    messages.success(request, 'Message supprimé avec succès.')
    return redirect('messages')


@login_required
def notifications_list(request):
    """Liste des notifications"""
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    
    # Pagination
    paginator = Paginator(notifications, 20)
    page = request.GET.get('page')
    notifications = paginator.get_page(page)
    
    # Compter les notifications non lues
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    
    context = {
        'notifications': notifications,
        'unread_count': unread_count,
    }
    return render(request, 'communication/notifications.html', context)


@login_required
def mark_notification_read(request, notification_id):
    """Marquer une notification comme lue"""
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.mark_as_read()
    
    if request.headers.get('Content-Type') == 'application/json':
        return JsonResponse({'status': 'success'})
    
    messages.success(request, 'Notification marquée comme lue.')
    return redirect('notifications')


@login_required
@csrf_exempt
def api_send_message(request):
    """API pour envoyer un message rapidement"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            recipient_id = data.get('recipient_id')
            title = data.get('title')
            content = data.get('content')
            priority = data.get('priority', 'normal')
            
            if not recipient_id or not title or not content:
                return JsonResponse({'status': 'error', 'message': 'Données manquantes'})
            
            recipient = get_object_or_404(User, id=recipient_id)
            
            message = Message.objects.create(
                sender=request.user,
                recipient=recipient,
                title=title,
                content=content,
                priority=priority
            )
            
            # Créer une notification
            Notification.objects.create(
                user=recipient,
                title=f"Nouveau message de {request.user.get_full_name()}",
                message=f"Vous avez reçu un nouveau message: {title}",
                notification_type='message',
                message_link=message
            )
            
            return JsonResponse({
                'status': 'success',
                'message': 'Message envoyé avec succès',
                'message_id': message.id
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'})


@login_required
def api_get_messages(request):
    """API pour récupérer les messages (pour AJAX)"""
    try:
        # Messages non lus
        unread_messages = Message.objects.filter(
            recipient=request.user,
            status='unread'
        ).order_by('-created_at')[:5]
        
        # Notifications non lues
        unread_notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).order_by('-created_at')[:5]
        
        data = {
            'unread_messages_count': Message.objects.filter(recipient=request.user, status='unread').count(),
            'unread_notifications_count': Notification.objects.filter(user=request.user, is_read=False).count(),
            'recent_messages': [
                {
                    'id': msg.id,
                    'title': msg.title,
                    'sender': msg.sender.get_full_name(),
                    'created_at': msg.created_at.strftime('%d/%m/%Y %H:%M'),
                    'priority': msg.priority
                } for msg in unread_messages
            ],
            'recent_notifications': [
                {
                    'id': notif.id,
                    'title': notif.title,
                    'created_at': notif.created_at.strftime('%d/%m/%Y %H:%M'),
                    'type': notif.notification_type
                } for notif in unread_notifications
            ]
        }
        
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
