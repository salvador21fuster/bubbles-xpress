import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SplitPolicy } from "@shared/schema";

export default function AdminPolicies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    policyJson: '{\n  "currency": "EUR",\n  "default": {\n    "origin_shop_pct": 0.2,\n    "processing_shop_pct": 0.55,\n    "driver_pct": 0.1,\n    "platform_pct": 0.15\n  },\n  "caps": {\n    "platform_min_cents": 50\n  },\n  "rounding": "HALF_UP_2DP"\n}',
  });

  const { data: policies = [] } = useQuery<SplitPolicy[]>({
    queryKey: ["/api/policies/split"],
  });

  const createPolicyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/policies/split", {
        name: formData.name,
        version: formData.version,
        policy_json: JSON.parse(formData.policyJson),
      });
    },
    onSuccess: () => {
      toast({
        title: "Policy Created",
        description: "New split policy has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/policies/split"] });
      setShowForm(false);
      setFormData({
        name: '',
        version: '',
        policyJson: '{\n  "currency": "EUR",\n  "default": {\n    "origin_shop_pct": 0.2,\n    "processing_shop_pct": 0.55,\n    "driver_pct": 0.1,\n    "platform_pct": 0.15\n  },\n  "caps": {\n    "platform_min_cents": 50\n  },\n  "rounding": "HALF_UP_2DP"\n}',
      });
    },
    onError: (error) => {
      toast({
        title: "Policy Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      JSON.parse(formData.policyJson);
      createPolicyMutation.mutate();
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Please check your policy JSON format",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policy Management</h1>
          <p className="text-muted-foreground">Configure revenue split policies</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2" data-testid="button-add-policy">
          <Plus className="h-4 w-4" />
          Add Policy
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Split Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-name">Policy Name</Label>
                  <Input
                    id="policy-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Default EUR policy"
                    required
                    data-testid="input-policy-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy-version">Version</Label>
                  <Input
                    id="policy-version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="2025-10-01"
                    required
                    data-testid="input-policy-version"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy-json">Policy JSON</Label>
                <Textarea
                  id="policy-json"
                  value={formData.policyJson}
                  onChange={(e) => setFormData({ ...formData, policyJson: e.target.value })}
                  className="font-mono text-sm h-64"
                  data-testid="textarea-policy-json"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createPolicyMutation.isPending} data-testid="button-submit-policy">
                  {createPolicyMutation.isPending ? "Creating..." : "Create Policy"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} data-testid="button-cancel-policy">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>{policy.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Version: {policy.version}</p>
                  </div>
                </div>
                {policy.isActive && (
                  <Badge className="bg-green-500 text-white border-0">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(policy.policyJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
