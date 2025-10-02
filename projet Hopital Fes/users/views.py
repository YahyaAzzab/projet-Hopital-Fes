from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from rest_framework.authtoken.models import Token
from .models import UserProfile
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer, UserProfileSerializer
from .forms import UserForm

User = get_user_model()

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

@api_view(['POST'])
@permission_classes([])
def login_view(request):
    """Vue de connexion pour l'API"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email et mot de passe requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Chercher l'utilisateur par email
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur non trouvé'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Vérifier le mot de passe
    if user.check_password(password) and user.is_active:
        # Créer ou récupérer le token
        token, created = Token.objects.get_or_create(user=user)
        
        # Sérialiser les données utilisateur
        serializer = UserSerializer(user)
        
        return Response({
            'token': token.key,
            'user': serializer.data,
            'message': 'Connexion réussie'
        })
    else:
        return Response(
            {'error': 'Identifiants invalides'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Vue de déconnexion pour l'API"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Déconnexion réussie'})
    except:
        return Response({'error': 'Erreur lors de la déconnexion'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Vue pour récupérer l'utilisateur actuel"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_permissions_view(request):
    """Vue pour récupérer les permissions de l'utilisateur actuel"""
    permissions = request.user.get_all_permissions()
    return Response({
        'permissions': list(permissions),
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser
    })

# Vues frontend pour les utilisateurs
@login_required
def user_add_view(request):
    """Vue pour ajouter un nouvel utilisateur"""
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password1'])
            user.save()
            messages.success(request, 'Utilisateur créé avec succès!')
            return redirect('users')
    else:
        form = UserForm()
    
    context = {
        'form': form,
        'role_choices': User.ROLE_CHOICES,
    }
    
    return render(request, 'users/user_add.html', context)

# Vues pour les actions des utilisateurs
@login_required
def user_detail_view(request, pk):
    """Vue pour afficher les détails d'un utilisateur"""
    try:
        user = User.objects.get(pk=pk)
        context = {
            'user': user,
        }
        return render(request, 'users/user_detail.html', context)
    except User.DoesNotExist:
        messages.error(request, 'Utilisateur non trouvé.')
        return redirect('users')

@login_required
def user_edit_view(request, pk):
    """Vue pour modifier un utilisateur"""
    try:
        user = User.objects.get(pk=pk)
        if request.method == 'POST':
            form = UserForm(request.POST, instance=user)
            if form.is_valid():
                user = form.save()
                messages.success(request, 'Utilisateur modifié avec succès!')
                return redirect('users')
        else:
            form = UserForm(instance=user)
        
        context = {
            'form': form,
            'user': user,
            'role_choices': User.ROLE_CHOICES,
        }
        return render(request, 'users/user_edit.html', context)
    except User.DoesNotExist:
        messages.error(request, 'Utilisateur non trouvé.')
        return redirect('users')

@login_required
def user_delete_view(request, pk):
    """Vue pour supprimer un utilisateur"""
    try:
        user = User.objects.get(pk=pk)
        if request.method == 'POST':
            user.delete()
            messages.success(request, 'Utilisateur supprimé avec succès!')
            return redirect('users')
        
        context = {
            'user': user,
        }
        return render(request, 'users/user_confirm_delete.html', context)
    except User.DoesNotExist:
        messages.error(request, 'Utilisateur non trouvé.')
        return redirect('users')