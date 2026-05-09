import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, Users, FileText, Loader2 } from 'lucide-react';

const Icons = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText
};

const InteractionsPage = () => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    try {
      const records = await pb.collection('interactions').getFullList({
        sort: '-date',
        $autoCancel: false
      });
      setInteractions(records);
    } catch (error) {
      console.error("Error fetching interactions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CrmLayout title="Interactions">
      <Helmet><title>Interactions - CRM</title></Helmet>

      <div className="max-w-3xl">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : interactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            No interactions logged yet.
          </div>
        ) : (
          <div className="space-y-6">
            {interactions.map((interaction) => {
              const Icon = Icons[interaction.type] || FileText;
              return (
                <Card key={interaction.id} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 capitalize">{interaction.type}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(interaction.date || interaction.created).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{interaction.description}</p>
                      {interaction.nextFollowUp && (
                        <p className="text-xs text-orange-600 mt-3 font-medium">
                          Next Follow-up: {new Date(interaction.nextFollowUp).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CrmLayout>
  );
};

export default InteractionsPage;