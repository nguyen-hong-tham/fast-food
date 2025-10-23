import DashboardLayout from '@/components/DashboardLayout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Settings features will be migrated here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
