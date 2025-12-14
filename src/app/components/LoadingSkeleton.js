// src/app/components/LoadingSkeleton.js
"use client";

import { Card, Skeleton, Space } from "antd";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton.Button active size="large" style={{ width: 200 }} />
        <Skeleton.Button active size="large" style={{ width: 150 }} />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="fade-in-up">
            <Skeleton active />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EventDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton.Input active size="large" style={{ width: 300 }} block />
        <Skeleton.Input active size="small" style={{ width: 200 }} block />
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Skeleton.Input active size="small" style={{ width: 100 }} />
              <Skeleton.Input active size="large" style={{ width: 60 }} />
            </Space>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card>
        <Space>
          <Skeleton.Button active size="large" />
          <Skeleton.Button active size="large" />
          <Skeleton.Button active size="large" />
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    </div>
  );
}

export function InviteSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header card */}
      <Card>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Skeleton.Input active size="large" style={{ width: "100%" }} block />
          <Skeleton active paragraph={{ rows: 3 }} />
        </Space>
      </Card>

      {/* Map card */}
      <Card
        title={<Skeleton.Input active size="small" style={{ width: 100 }} />}
      >
        <div style={{ height: 300, background: "#f0f0f0", borderRadius: 8 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </Card>

      {/* Weather card */}
      <Card>
        <Space style={{ width: "100%" }} size="large">
          <Skeleton.Avatar active size={64} />
          <div style={{ flex: 1 }}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        </Space>
      </Card>

      {/* Form card */}
      <Card
        title={<Skeleton.Input active size="small" style={{ width: 150 }} />}
      >
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Skeleton.Input active size="large" block />
        <Skeleton active paragraph={{ rows: 2 }} />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton.Input active size="large" block />
          <Skeleton.Input active size="large" block />
          <Skeleton.Input active size="large" block />
        </div>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton.Button active size="large" block />
      </Space>
    </Card>
  );
}
