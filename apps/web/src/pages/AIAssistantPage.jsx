import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Bot, Image as ImageIcon, MessageSquare, History, Settings2, Sparkles } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import IntegratedAiChat from '@/components/integrated-ai-chat.jsx';

const features = [
  { icon: MessageSquare, title: 'Multi-turn Conversation', desc: 'The AI remembers context from previous messages, allowing for deep, natural interactions.' },
  { icon: ImageIcon, title: 'Image Generation', desc: 'Describe what you want, and the AI will generate high-quality images directly in the chat.' },
  { icon: History, title: 'Chat History', desc: 'Securely saves your past conversations so you can pick up exactly where you left off.' },
  { icon: Settings2, title: 'Customizable Persona', desc: 'System prompts adjust the AI tone, expertise, and format to match your specific business needs.' }
];

const AIAssistantPage = () => {
  return (
    <>
      <Helmet><title>AI Assistant | OxgenieEdge</title></Helmet>
      <Header />

      <main className="bg-[#111827] min-h-screen text-white">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center px-4 py-2 bg-[#F97316]/10 text-[#F97316] rounded-full mb-8 font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced LLMs
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-balance">
              Meet Your New <span className="text-[#F97316]">Digital Co-worker</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
              Brainstorm strategies, generate marketing visuals, and solve complex problems in real-time with our integrated AI Assistant.
            </p>
            <a href="#demo" className="px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold transition-all shadow-lg inline-flex">
              Start Chatting Now
            </a>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-[#1F2937]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#111827] p-8 rounded-2xl border border-gray-800"
                >
                  <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center mb-6">
                    <feat.icon className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Chat Demo Section */}
        <section id="demo" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Try It Yourself</h2>
            <p className="text-gray-400">Interact with the AI Assistant below. Ask it to "generate an image of a futuristic city" or "write a marketing email."</p>
          </div>
          
          <div className="max-w-4xl mx-auto h-[600px] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl bg-[#1F2937]">
            {/* Embedded AI Chat component */}
            <IntegratedAiChat />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AIAssistantPage;