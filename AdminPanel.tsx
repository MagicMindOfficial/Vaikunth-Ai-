import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { 
  BarChart3, 
  Users, 
  Layers, 
  Settings as SettingsIcon, 
  TrendingUp, 
  ShieldAlert, 
  Trash2, 
  Ban,
  Activity,
  DollarSign,
  Key,
  Globe,
  Mail
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Logo } from '../components/Logo';
import { UserProfile, Creation } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

export default function AdminPanel() {
  const [stats, setStats] = useState({
    users: 0,
    creations: 0,
    revenue: 0,
    activeSubs: 0
  });
  const [recentActivity, setRecentActivity] = useState<Creation[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch all users
        const usersSnap = await getDocs(collection(db, 'users'));
        const allUsers: UserProfile[] = [];
        usersSnap.forEach(doc => {
          allUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });

        // Fetch recent creations
        const creationsQuery = query(collection(db, 'creations'), orderBy('createdAt', 'desc'), limit(50));
        const creationsSnap = await getDocs(creationsQuery);
        const allCreations: Creation[] = [];
        creationsSnap.forEach(doc => {
          allCreations.push({ id: doc.id, ...doc.data() } as Creation);
        });

        // Fetch support messages
        const messagesSnap = await getDocs(query(collection(db, 'support_messages'), orderBy('createdAt', 'desc')));
        const allMessages: any[] = [];
        messagesSnap.forEach(doc => {
          allMessages.push({ id: doc.id, ...doc.data() });
        });

        // Metrics calculation
        const totalUsers = allUsers.length;
        const totalCreations = allCreations.length; 
        const activeSubs = allUsers.filter(u => u.plan !== 'Starter').length;
        const revenue = activeSubs * 29;

        setStats({
          users: totalUsers,
          creations: totalCreations,
          revenue,
          activeSubs
        });

        setUsers(allUsers);
        setMessages(allMessages);
        setRecentActivity(allCreations);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchAdminData();
  }, [isAdmin]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(prev => prev.filter(u => u.uid !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'support_messages', id));
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'support_messages', id), { status: 'read' });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <Card className="bg-white/5 border-white/10 p-12 text-center space-y-6 max-w-lg rounded-[3rem]">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mx-auto">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Access Denied</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest line-clamp-3">
             Your clearance level is insufficient for Command access. 
             Only authorized neural administrators may enter this sanctum.
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full h-14 bg-white text-black font-bold rounded-2xl">
            Return to Safety
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Layout hideNav>
      <div className="p-6 pb-12 space-y-8 bg-black">
        <header className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Logo size={60} />
              <div>
                <div className="flex items-center gap-2">
                   <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Vaikunth AI Command</h1>
                   <div className="px-2 py-0.5 bg-purple-500 text-white text-[8px] font-black rounded uppercase pulse">Active Admin</div>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Welcome Admin. Your node is synchronized.</p>
              </div>
           </div>
           <Button variant="outline" className="border-white/10 text-xs font-bold uppercase h-10 px-6 rounded-xl hover:bg-white hover:text-black transition-all">
              Security Logs
           </Button>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <StatCard label="Total Intelligence" value={stats.users} sub="Verified Users" icon={<Users size={16} />} color="blue" />
           <StatCard label="Neural Assets" value={stats.creations} sub="Total Creations" icon={<Layers size={16} />} color="purple" />
           <StatCard label="Global Revenue" value={`₹${stats.revenue}`} sub="This Month" icon={<DollarSign size={16} />} color="green" />
           <StatCard label="System Heat" value="98.4%" sub="Active Uptime" icon={<Activity size={16} />} color="orange" />
        </section>

        <Tabs defaultValue="dashboard" className="space-y-8">
            <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl w-full max-w-3xl mx-auto shadow-2xl">
              <TabsTrigger value="dashboard" className="flex-1 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">Command</TabsTrigger>
              <TabsTrigger value="users" className="flex-1 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">Operators</TabsTrigger>
              <TabsTrigger value="messages" className="flex-1 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">Support Feed</TabsTrigger>
              <TabsTrigger value="creations" className="flex-1 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">Neural Feed</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest transition-all">Core Config</TabsTrigger>
           </TabsList>

           <TabsContent value="dashboard" className="space-y-8 mt-0">
              <div className="grid lg:grid-cols-2 gap-8">
                 <Card className="bg-white/5 border-white/10 p-8 space-y-6 rounded-[2.5rem]">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black uppercase tracking-widest text-white">Resource Usage</h3>
                       <TrendingUp size={16} className="text-green-500" />
                    </div>
                    <div className="space-y-6">
                       <UsageBar label="Gemini Flash Image" val={72} total="100K API" />
                       <UsageBar label="Veo Video Generator" val={45} total="50K API" />
                       <UsageBar label="Text to Speech Neural" val={88} total="500K API" />
                       <UsageBar label="Cloud Firestore Read" val={12} total="2M Read" />
                    </div>
                 </Card>

                 <Card className="bg-white/5 border-white/10 p-8 space-y-6 rounded-[2.5rem]">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Activity</h3>
                       <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <div className="text-[10px] text-green-500 font-bold uppercase">Streaming</div>
                       </div>
                    </div>
                    <ScrollArea className="h-[240px] pr-4">
                       <div className="space-y-4">
                          {recentActivity.map((c) => (
                            <div key={c.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 capitalize">
                               <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-xs text-gray-500">
                                  {c.type[0].toUpperCase()}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{c.tool}</p>
                                  <p className="text-[10px] text-gray-600 truncate">{c.input}</p>
                               </div>
                               <div className="text-[9px] text-gray-700 font-black uppercase text-right">
                                  <p>{c.type}</p>
                                  <p className="opacity-40">{c.quality || 'N/A'}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </ScrollArea>
                 </Card>
              </div>
           </TabsContent>

           <TabsContent value="users" className="mt-0">
              <Card className="bg-white/5 border-white/10 p-8 space-y-6 rounded-[2.5rem]">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Operator Registry</h3>
                    <div className="bg-black/50 border border-white/10 rounded-xl flex items-center h-10 px-4">
                       <input className="bg-transparent border-none focus:ring-0 text-xs text-white" placeholder="Search by UID or Email..." />
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs uppercase tracking-widest font-bold">
                       <thead className="text-gray-600 border-b border-white/10">
                          <tr>
                             <th className="pb-4 pt-2">Identity</th>
                             <th className="pb-4 pt-2">Vocation</th>
                             <th className="pb-4 pt-2">Output Count</th>
                             <th className="pb-4 pt-2">Joined</th>
                             <th className="pb-4 pt-2">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="text-gray-400">
                          {users.map((u, i) => (
                            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                               <td className="py-4 text-white">{u.email}</td>
                               <td className="py-4">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[9px]",
                                    u.plan === 'Studio' ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-gray-500"
                                  )}>{u.plan}</span>
                               </td>
                               <td className="py-4">{u.creationsCount} Units</td>
                               <td className="py-4 text-[10px]">{new Date(u.joinedAt).toLocaleDateString()}</td>
                               <td className="py-4">
                                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button className="text-blue-500"><Ban size={14} /></button>
                                     <button 
                                      onClick={() => handleDeleteUser(u.uid)}
                                      className="text-red-500"
                                     >
                                       <Trash2 size={14} />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </Card>
           </TabsContent>
           
           <TabsContent value="messages" className="mt-0">
               <Card className="bg-white/5 border-white/10 p-8 space-y-6 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-black uppercase tracking-widest text-white">Support Transmissions</h3>
                     <div className="text-[10px] text-purple-400 font-black uppercase tracking-widest">{messages.length} Active Tickets</div>
                  </div>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">No support transmissions received</div>
                      ) : (
                        messages.map((m) => (
                          <div key={m.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3 group hover:border-purple-500/30 transition-all">
                            <header className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest">{m.email}</p>
                                <h4 className="text-xs font-black text-white uppercase mt-1">{m.subject}</h4>
                              </div>
                              <span className="text-[8px] text-gray-600 font-black">{new Date(m.createdAt).toLocaleString()}</span>
                            </header>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{m.message}</p>
                            <footer className="flex justify-between items-center pt-2 border-t border-white/5">
                               <div className={cn(
                                 "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest",
                                 m.status === 'unread' ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                               )}>{m.status}</div>
                               <div className="flex gap-2">
                                 {m.status === 'unread' && (
                                   <button 
                                    onClick={() => handleMarkAsRead(m.id)}
                                    className="text-blue-500 p-1 hover:bg-blue-500/10 rounded transition-colors tracking-widest uppercase font-black text-[8px]"
                                   >
                                     Read
                                   </button>
                                 )}
                                 <button 
                                  onClick={() => handleDeleteMessage(m.id)}
                                  className="text-red-500 p-1 hover:bg-red-500/10 rounded transition-colors tracking-widest uppercase font-black text-[8px]"
                                 >
                                   Delete
                                 </button>
                               </div>
                            </footer>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
               </Card>
            </TabsContent>
           <TabsContent value="settings" className="mt-0">
             <div className="grid lg:grid-cols-3 gap-6">
                <AdminSetting icon={<Key />} label="API Matrix" desc="Manage Intelligence Keys" />
                <AdminSetting icon={<Globe />} label="System Pulse" desc="Maintenance Mode & Region" />
                <AdminSetting icon={<SettingsIcon />} label="Plan Config" desc="Edit Limitations & Pricing" />
             </div>
           </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, sub, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  };
  return (
    <Card className={cn("p-6 space-y-4 rounded-[2rem]", colors[color])}>
       <div className="p-3 bg-black/40 rounded-2xl w-fit">{icon}</div>
       <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</h4>
          <p className="text-2xl font-black text-white tracking-widest uppercase">{value}</p>
          <p className="text-[9px] font-bold opacity-40 uppercase mt-1">{sub}</p>
       </div>
    </Card>
  );
}

function UsageBar({ label, val, total }: any) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
          <span>{label}</span>
          <span className="text-white">{val}% <span className="opacity-40 ml-1">/ {total}</span></span>
       </div>
       <Progress value={val} className="h-4" />
    </div>
  );
}

function AdminSetting({ icon, label, desc }: any) {
  return (
    <Card className="bg-white/5 border-white/5 p-8 flex flex-col items-center text-center space-y-4 hover:border-white/20 transition-all cursor-pointer rounded-[2.5rem] group">
       <div className="p-5 rounded-3xl bg-black border border-white/10 text-gray-500 group-hover:text-white group-hover:scale-110 transition-all">{icon}</div>
       <div>
          <h4 className="text-sm font-black text-white uppercase tracking-tight">{label}</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{desc}</p>
       </div>
    </Card>
  );
}
