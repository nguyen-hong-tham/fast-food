import DashboardLayout from '@/components/DashboardLayout';

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Order management features will be migrated here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
