"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Loader2,
  Search,
  Star,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface MarketplaceService {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  type: string;
  version: string;
  logo?: string;
  totalInstalls: number;
  rating?: number;
  reviews: number;
  isInstalled: boolean;
  requiredFields: Record<string, boolean>;
  optionalFields: Record<string, boolean>;
}

interface InstalledService {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  description?: string;
  lastTestStatus?: string;
  lastTestedAt?: string;
}

export function MCPMarketplaceClient() {
  const [activeTab, setActiveTab] = useState("browse");
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [installedServices, setInstalledServices] = useState<InstalledService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);

  // 加載市場數據
  useEffect(() => {
    loadMarketplace();
  }, [selectedCategory, searchQuery]);

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/mcp/marketplace?${params}`);
      const data = await response.json();

      if (data.success) {
        setServices(data.marketplace || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      toast.error("無法加載市場數據");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加載已安裝的服務
  useEffect(() => {
    const loadInstalled = async () => {
      try {
        const response = await fetch("/api/mcp/marketplace?action=installed");
        const data = await response.json();
        if (data.success) {
          setInstalledServices(data.installed || []);
        }
      } catch (error) {
        console.error("Failed to load installed services:", error);
      }
    };

    loadInstalled();
  }, []);

  const handleInstall = async (service: MarketplaceService) => {
    if (service.isInstalled) {
      toast.info(`${service.displayName} 已經安裝`);
      return;
    }

    setInstalling((prev) => new Set(prev).add(service.id));

    try {
      const response = await fetch("/api/mcp/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registryId: service.id,
          config: {},
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "安裝失敗");
      }

      toast.success(`${service.displayName} 已安裝`, {
        description: data.message,
      });

      // 重新加載數據
      loadMarketplace();
      setInstalledServices((prev) => [
        ...prev,
        {
          id: data.serviceId,
          name: service.name,
          type: service.type,
          enabled: true,
          description: service.description,
        },
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "安裝失敗"
      );
    } finally {
      setInstalling((prev) => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 安裝確認對話框 */}
      <Dialog
        open={selectedService !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedService(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>安裝 {selectedService?.displayName}</DialogTitle>
            <DialogDescription>
              {selectedService?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4">
              {Object.keys(selectedService.requiredFields).length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    必填配置
                  </h4>
                  <div className="space-y-2 text-xs text-stone-600">
                    {Object.keys(selectedService.requiredFields).map(
                      (field) => (
                        <div key={field} className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                          {field}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  handleInstall(selectedService);
                  setSelectedService(null);
                }}
                className="w-full"
                disabled={installing.has(selectedService.id)}
              >
                {installing.has(selectedService.id) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    安裝中...
                  </>
                ) : (
                  "確認安裝"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">瀏覽市場</TabsTrigger>
          <TabsTrigger value="installed">
            已安裝 ({installedServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* 搜尋和篩選 */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input
                placeholder="搜尋 MCP 服務..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 分類篩選 */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  全部
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* 服務網格 */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500">未找到服務</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`flex flex-col transition-all ${
                    service.isInstalled ? "border-green-200 bg-green-50" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {service.displayName}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          v{service.version}
                        </CardDescription>
                      </div>
                      {service.isInstalled && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <p className="text-sm text-stone-600">
                      {service.description}
                    </p>

                    {/* 統計信息 */}
                    <div className="flex items-center gap-4 text-xs text-stone-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {service.totalInstalls}+
                      </div>
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {service.rating}
                        </div>
                      )}
                    </div>

                    {/* 標籤 */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {service.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {service.type}
                      </Badge>
                    </div>

                    {/* 必填字段提示 */}
                    {Object.keys(service.requiredFields).length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <AlertCircle className="h-3 w-3" />
                        需要配置
                      </div>
                    )}

                    {/* 安裝按鈕 */}
                    <div className="pt-2">
                      <Button
                        size="sm"
                        className="w-full"
                        variant={service.isInstalled ? "secondary" : "default"}
                        disabled={installing.has(service.id) || service.isInstalled}
                        onClick={() => {
                          if (!service.isInstalled) {
                            setSelectedService(service);
                          }
                        }}
                      >
                        {installing.has(service.id) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            安裝中...
                          </>
                        ) : service.isInstalled ? (
                          "已安裝"
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            安裝
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="installed" className="space-y-4">
          {installedServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 mb-4">未安裝任何服務</p>
              <Button
                onClick={() => {
                  setActiveTab("browse");
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
              >
                瀏覽市場
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {installedServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {service.name}
                        </CardTitle>
                        {service.description && (
                          <CardDescription className="text-xs">
                            {service.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {service.lastTestStatus === "success" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <Badge
                          variant={service.enabled ? "default" : "secondary"}
                        >
                          {service.enabled ? "啟用" : "停用"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
