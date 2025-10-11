import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, CreditCard, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Shop } from "@shared/schema";

export default function ShopProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: shop, isLoading } = useQuery<Shop>({
    queryKey: ['/api/shop/profile'],
    enabled: !!user?.shopId,
  });

  const [formData, setFormData] = useState({
    franchiseName: shop?.franchiseName || '',
    name: shop?.name || '',
    address: shop?.address || '',
    city: shop?.city || '',
    eircode: shop?.eircode || '',
    contactEmail: shop?.contactEmail || '',
    contactPhone: shop?.contactPhone || '',
    subscriptionType: shop?.subscriptionType || 'monthly',
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PATCH", `/api/shop/profile`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shop/profile'] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your shop profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update shop profile.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48 mb-6" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const subscriptionFeeDisplay = shop?.subscriptionFee 
    ? `€${(shop.subscriptionFee / 100).toFixed(2)}`
    : 'Not set';

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Franchise Profile</h1>
          <p className="text-muted-foreground">Manage your shop details and subscription</p>
        </div>
        {!isEditing && (
          <Button onClick={() => {
            setFormData({
              franchiseName: shop?.franchiseName || '',
              name: shop?.name || '',
              address: shop?.address || '',
              city: shop?.city || '',
              eircode: shop?.eircode || '',
              contactEmail: shop?.contactEmail || '',
              contactPhone: shop?.contactPhone || '',
              subscriptionType: shop?.subscriptionType || 'monthly',
            });
            setIsEditing(true);
          }} data-testid="button-edit-profile">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Business Details</CardTitle>
            </div>
            <CardDescription>Your franchise information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="franchiseName">Franchise Name</Label>
              <Input
                id="franchiseName"
                value={isEditing ? formData.franchiseName : shop?.franchiseName || 'Not set'}
                onChange={(e) => setFormData({ ...formData, franchiseName: e.target.value })}
                disabled={!isEditing}
                placeholder="Mr Bubbles Express"
                data-testid="input-franchise-name"
              />
            </div>

            <div>
              <Label htmlFor="name">Shop Name</Label>
              <Input
                id="name"
                value={isEditing ? formData.name : shop?.name || 'Not set'}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                placeholder="Downtown Launderette"
                data-testid="input-shop-name"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={isEditing ? formData.address : shop?.address || 'Not set'}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                placeholder="123 Main Street"
                data-testid="input-address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={isEditing ? formData.city : shop?.city || 'Not set'}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Drogheda"
                  data-testid="input-city"
                />
              </div>
              <div>
                <Label htmlFor="eircode">Eircode</Label>
                <Input
                  id="eircode"
                  value={isEditing ? formData.eircode : shop?.eircode || 'Not set'}
                  onChange={(e) => setFormData({ ...formData, eircode: e.target.value })}
                  disabled={!isEditing}
                  placeholder="A92 XXXX"
                  data-testid="input-eircode"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Subscription</CardTitle>
            </div>
            <CardDescription>Your Mr Bubbles Express subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subscriptionType">Subscription Type</Label>
              {isEditing ? (
                <Select
                  value={formData.subscriptionType}
                  onValueChange={(value) => setFormData({ ...formData, subscriptionType: value })}
                >
                  <SelectTrigger data-testid="select-subscription-type">
                    <SelectValue placeholder="Select subscription type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={shop?.subscriptionType ? shop.subscriptionType.charAt(0).toUpperCase() + shop.subscriptionType.slice(1) : 'Not set'}
                  disabled
                  data-testid="text-subscription-type"
                />
              )}
            </div>

            <div>
              <Label>Subscription Fee</Label>
              <Input
                value={subscriptionFeeDisplay}
                disabled
                data-testid="text-subscription-fee"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contact admin to change subscription fee
              </p>
            </div>

            <div>
              <Label>Subscription Status</Label>
              <div className="mt-2">
                <Badge 
                  variant={shop?.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                  data-testid="badge-subscription-status"
                >
                  {shop?.subscriptionStatus || 'active'}
                </Badge>
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={isEditing ? formData.contactEmail : shop?.contactEmail || 'Not set'}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                disabled={!isEditing}
                placeholder="contact@shop.com"
                data-testid="input-contact-email"
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={isEditing ? formData.contactPhone : shop?.contactPhone || 'Not set'}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                disabled={!isEditing}
                placeholder="+353 XX XXX XXXX"
                data-testid="input-contact-phone"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditing && (
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            data-testid="button-save-profile"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={updateMutation.isPending}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
