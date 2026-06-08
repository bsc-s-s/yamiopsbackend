import { supabase } from '../../config/database.js';

export async function getResume(tenantId) {
  const today = new Date().toISOString().split('T')[0];

  const [
    { count: totalRooms },
    { count: occupiedRooms },
    { count: availableRooms },
    { count: cleaningRooms },
    { count: openIncidents },
    { count: criticalIncidents },
    { count: activeReservations },
    { count: pendingCleaning },
    { data: todayFinance },
  ] = await Promise.all([
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'occupied'),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'available'),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'cleaning'),
    supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).not('status', 'in', '("resolved","closed")'),
    supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('priority', 'critical').not('status', 'in', '("resolved","closed")'),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).in('status', ['confirmed', 'checked_in']),
    supabase.from('financial_records').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'pending'),
    supabase.from('financial_records').select('type, amount').eq('tenant_id', tenantId).gte('recorded_at', today),
  ]);

  const incomeToday = (todayFinance || []).filter(r => r.type === 'income').reduce((s, r) => s + parseFloat(r.amount), 0);
  const expenseToday = (todayFinance || []).filter(r => r.type === 'expense').reduce((s, r) => s + parseFloat(r.amount), 0);

  const { data: recentActivity } = await supabase
    .from('reservations')
    .select('id, status, check_in, check_out, customers(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: incidentsByDept } = await supabase
    .from('incidents')
    .select('department, status')
    .eq('tenant_id', tenantId)
    .not('status', 'in', '("resolved","closed")');

  const deptCounts = {};
  for (const inc of incidentsByDept || []) {
    deptCounts[inc.department] = (deptCounts[inc.department] || 0) + 1;
  }

  return {
    occupancy: {
      total: totalRooms,
      occupied: occupiedRooms,
      available: availableRooms,
      cleaning: cleaningRooms,
      rate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0.0',
    },
    incidents: {
      open: openIncidents,
      critical: criticalIncidents,
      byDepartment: deptCounts,
    },
    finance: {
      incomeToday,
      expenseToday,
      balanceToday: incomeToday - expenseToday,
    },
    reservations: {
      active: activeReservations,
      pendingCleaning: pendingCleaning,
    },
    recentActivity: recentActivity || [],
  };
}

export async function getOccupancyTimeline(tenantId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('reservations')
    .select('check_in, check_out, status')
    .eq('tenant_id', tenantId)
    .gte('check_in', startDate.toISOString().split('T')[0])
    .order('check_in');

  if (error) throw error;

  const timeline = {};
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    timeline[key] = { date: key, occupied: 0, checkins: 0, checkouts: 0 };
  }

  for (const r of data || []) {
    if (r.status === 'confirmed' || r.status === 'checked_in') {
      const checkIn = r.check_in?.split('T')[0];
      const checkOut = r.check_out?.split('T')[0];
      if (timeline[checkIn]) {
        timeline[checkIn].checkins++;
      }
      if (timeline[checkOut]) {
        timeline[checkOut].checkouts++;
      }
    }
  }

  return Object.values(timeline);
}
