from django.urls import path
from . import views

urlpatterns = [
    path('', views.messages_list, name='messages'),
    path('compose/', views.compose_message, name='compose_message'),
    path('<int:message_id>/', views.message_detail, name='message_detail'),
    path('<int:message_id>/reply/', views.reply_message, name='reply_message'),
    path('<int:message_id>/delete/', views.delete_message, name='delete_message'),
    path('notifications/', views.notifications_list, name='notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('api/send-message/', views.api_send_message, name='api_send_message'),
    path('api/get-messages/', views.api_get_messages, name='api_get_messages'),
]
