import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const statusColors = {
  'Open': 'bg-red-100 text-red-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Resolved': 'bg-green-100 text-green-800',
};

const ServicesPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const records = await pb.collection('serviceTickets').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setTickets(records);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CrmLayout title="Service Tickets">
      <Helmet><title>Services - CRM</title></Helmet>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  No active service tickets.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium text-gray-900">{ticket.title}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{ticket.customerId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ticket.priority === 'High' ? 'border-red-500 text-red-600' : ''}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[ticket.status] || 'bg-gray-100'}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(ticket.created).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CrmLayout>
  );
};

export default ServicesPage;