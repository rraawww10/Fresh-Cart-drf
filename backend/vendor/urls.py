from django.urls import path

from .views import (
    VendorOrderItemListView,
    VendorOrderItemUpdateView,
    VendorProductListView,
    VendorSummaryView,
)

urlpatterns = [
    path('products/', VendorProductListView.as_view(), name='vendor-products'),
    path('orders/', VendorOrderItemListView.as_view(), name='vendor-orders'),
    path(
        'orders/items/<int:pk>/',
        VendorOrderItemUpdateView.as_view(),
        name='vendor-order-item',
    ),
    path('summary/', VendorSummaryView.as_view(), name='vendor-summary'),
]
