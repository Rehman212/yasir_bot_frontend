import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Profile, publishing defaults, notifications, and security controls.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Profile settings</h2>
          <Input label="Full name" defaultValue="Amina Rahman" />
          <Input label="Email" type="email" defaultValue="amina@growthlab.com" />
          <Input label="Profile image" type="file" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Button type="button">Save profile</Button>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Publishing settings</h2>
          <Select label="Default timezone" defaultValue="PKT">
            <option>PKT (UTC+5)</option>
            <option>UTC</option>
            <option>EST</option>
          </Select>
          <Select label="Default article status">
            <option>Draft</option>
            <option>Publish</option>
            <option>Schedule</option>
          </Select>
          <Input label="Default publishing interval" defaultValue="120 minutes" />
          <Input label="Retry limit" type="number" defaultValue={3} />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" defaultChecked className="rounded border-border" />
            Email notifications for failed posts
          </label>
          <Button type="button">Save publishing defaults</Button>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Security settings</h2>
          <p className="text-sm text-muted">Active sessions · Change password · 2FA · Login history</p>
          <Button variant="secondary" type="button">
            Enable two-factor authentication
          </Button>
          <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium">Current session · Chrome on Windows</p>
            <p className="text-muted">Last active just now</p>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium">Login history</p>
            <p className="text-muted">Aug 17, 09:10 · Successful login</p>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Subscription settings</h2>
          <p className="text-sm text-muted">
            Current plan: Professional · 86 / 1,000 articles used · 4 / 10 websites
          </p>
          <div className="flex flex-wrap gap-2">
            <Button href="/subscription">Manage subscription</Button>
            <Button variant="secondary" href="/pricing">
              Upgrade or downgrade
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
