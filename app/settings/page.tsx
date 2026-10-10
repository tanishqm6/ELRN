'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Info, RotateCcw, Trash2, MapPin, Bell, Radio } from 'lucide-react';
import { useAppState } from '@/lib/state';

export default function SettingsPage() {
  const { settings, updateSettings, resetDemo, clearAllLogs, logs, incidents, nodes } = useAppState();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearLogConfirm, setShowClearLogConfirm] = useState(false);

  const handleReset = () => {
    resetDemo();
    setShowResetConfirm(false);
    toast.success('Demo data reset', { description: 'All incidents, nodes, and logs restored to original state.' });
  };

  const handleClearLogs = () => {
    clearAllLogs();
    setShowClearLogConfirm(false);
    toast.success('Activity logs cleared');
  };

  return (
    <AppShell title="Settings" breadcrumb="Configuration">
      <div className="max-w-[640px] space-y-4">
        {/* Application Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Application Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product</span>
              <span className="font-medium">ELRN — Emergency LoRa Rescue Network</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description</span>
              <span className="text-right text-muted-foreground max-w-[320px]">Emergency communication and incident coordination when conventional networks fail.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/5 text-warning px-2 py-0.5 text-[11px] font-medium">Demo Mode</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Storage</span>
              <span className="font-medium">Browser localStorage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Data</span>
              <span className="font-medium">{incidents.length} incidents, {nodes.length} nodes, {logs.length} logs</span>
            </div>
          </CardContent>
        </Card>

        {/* Map Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Default Map Location
            </CardTitle>
            <CardDescription className="text-[12px]">The initial map center when the application loads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Default Center</span>
              <span className="font-mono">{settings.defaultMapLat.toFixed(4)}, {settings.defaultMapLng.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">Indore, Madhya Pradesh, India</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Default Zoom</span>
              <span className="font-medium">{settings.defaultMapZoom}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[13px]">Demo Notifications</Label>
                <p className="text-[12px] text-muted-foreground mt-0.5">Show toast notifications for actions and SOS events.</p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => {
                  updateSettings({ notificationsEnabled: checked });
                  toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[13px]">Auto Simulation</Label>
                <p className="text-[12px] text-muted-foreground mt-0.5">Automatically generate periodic network activity events.</p>
              </div>
              <Switch
                checked={settings.autoSimulation}
                onCheckedChange={(checked) => {
                  updateSettings({ autoSimulation: checked });
                  toast.success(`Auto simulation ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              Data Management
            </CardTitle>
            <CardDescription className="text-[12px]">
              Manage the demo data stored in your browser. These actions are irreversible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-10 justify-start text-[13px]"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Demo Data
              <span className="ml-auto text-[11px] text-muted-foreground">Restores original incidents, nodes, and logs</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 justify-start text-[13px]"
              onClick={() => setShowClearLogConfirm(true)}
              disabled={logs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Activity Logs
              <span className="ml-auto text-[11px] text-muted-foreground">Removes {logs.length} log entries</span>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-[11px] text-muted-foreground/70 pb-4">
          ELRN is a concept demonstration for a college hackathon. No real emergency services are connected.
        </div>
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Demo Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard all changes you've made — including new incidents, status updates, team assignments, notes, and node changes — and restore the original sample data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleReset}>
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearLogConfirm} onOpenChange={setShowClearLogConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Activity Logs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {logs.length} log entries. Incidents and node data will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleClearLogs}>
              Clear Logs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
