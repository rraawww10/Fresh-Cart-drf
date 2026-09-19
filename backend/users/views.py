from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    """POST /api/users/register/ — makes an account. It does NOT log you in."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Account created!'},
                status=status.HTTP_201_CREATED,
            )
        # Errors come back keyed by the field name, e.g.
        # {"username": ["A user with that username already exists."]}
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """POST /api/users/login/ — returns {"refresh": ..., "access": ...}.

    A wrong password answers 401 with {"detail": "..."}, a different shape from
    the register errors above. One error reader in React has to cope with both.
    """

    permission_classes = [AllowAny]


class LogoutView(APIView):
    """POST /api/users/logout/ — blacklists the refresh token, answers 205."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response(
                {'detail': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            return Response(
                {'detail': 'Token is invalid or expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)


class ProfileView(APIView):
    """GET /api/users/profile/ — who the token belongs to."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
