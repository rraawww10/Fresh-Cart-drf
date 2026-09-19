from django.urls import path

from .views import AddToCartView, CartItemDetailView, CartView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('add/', AddToCartView.as_view(), name='cart-add'),
    path('items/<int:pk>/', CartItemDetailView.as_view(), name='cart-item'),
]
