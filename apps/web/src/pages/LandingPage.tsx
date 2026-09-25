import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { 
  Receipt, 
  PieChart, 
  Camera, 
  Shield, 
  Zap,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  CreditCard,
  BarChart3,
  Bell,
  ChevronRight,
  Smartphone,
  Wallet,
  LineChart
} from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Pivoa" className="h-8 w-8 object-contain" />
                <span className="font-bold text-xl">Pivoa</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  How it works
                </a>
                <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </a>
                <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Signup</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Invest Intelligently,
                <br />
                Live Independently
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Your all-in-one solution to smarter money management. Track spending, set goals, and make informed financial decisions with clarity and ease.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="h-12 px-6">
                    Get Started
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-6" asChild>
                  <a href="#features">See Details</a>
                </Button>
              </div>
            </div>

            {/* Right - Phone Mockup with Cards */}
            <div className="relative flex justify-center lg:justify-end">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            <TrustLogo name="Dropbox" />
            <TrustLogo name="airbnb" />
            <TrustLogo name="GitHub" />
            <TrustLogo name="NETFLIX" />
            <TrustLogo name="HBO" />
          </div>
        </div>
      </section>

      {/* Feature Showcase - Left Card */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Savings Card Preview */}
            <div className="flex justify-center">
              <SavingsCardPreview />
            </div>

            {/* Right - Content */}
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Streamline Sales With
                <br />
                Seamless Payments
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Deliver A Frictionless Buying Experience With Secure, Responsive, And Fully Integrated Payment Tools
              </p>
              <ul className="space-y-4 mb-8">
                <FeatureCheckItem text="Real-Time Payment Tracking" />
                <FeatureCheckItem text="Accept Payments Quickly And Securely" />
                <FeatureCheckItem text="Effortless Integration With Your Platform" />
              </ul>
              <Link to="/register">
                <Button size="lg" className="h-12 px-6">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These are the questions we hear most often.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<CreditCard className="h-5 w-5" />}
              title="Account"
              description="Build Data With Login. Featuring All Fintech In Peace Of Mind."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Credit Score Monitoring"
              description="Stay On Top Of Your Financial Health With Real-Time Credit Score Monitoring And Personalized Improvement Tips."
            />
            <FeatureCard
              icon={<Wallet className="h-5 w-5" />}
              title="Real-Time Balance"
              description="Get Instant Access To Your Account Balance Anytime, Anywhere. So You Always Know Where Your Money Stands."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Pivoa Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in minutes and start taking control of your finances.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard number={1} title="Create Account" description="Sign up in seconds with just your email and password." />
              <StepCard number={2} title="Log Expenses" description="Add expenses manually or scan receipts with your camera." />
              <StepCard number={3} title="Grow" description="Understand your patterns and make smarter financial decisions." />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Title */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground mb-8">
                These are the questions we hear most often.
              </p>
              
              {/* FAQ Support Card */}
              <div className="bg-card border border-border rounded-xl p-6 max-w-sm">
                <h3 className="font-semibold mb-2">Don't see the answer you need?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  That's ok. Just drop a message and we will get back to you ASAP.
                </p>
                <Button variant="outline" size="sm">
                  Contact us
                </Button>
              </div>
            </div>

            {/* Right - FAQ Items */}
            <div className="space-y-0">
              <FAQItem 
                question="What is your platform?"
                answer="Pivoa is a smart personal finance platform that helps you track expenses, scan receipts with AI, and gain insights into your spending habits."
              />
              <FAQItem 
                question="How is my data safe and secure?"
                answer="We use industry-standard encryption and multi-factor authentication to keep your information protected at all times."
              />
              <FAQItem 
                question="Do I need to link my bank accounts to use this app?"
                answer="No, linking bank accounts is optional. You can manually track expenses or use our AI receipt scanning feature."
              />
              <FAQItem 
                question="Can I set financial goals and monitor progress?"
                answer="Yes! You can set savings goals, budget limits, and track your progress with visual charts and insights."
              />
              <FAQItem 
                question="What devices is this app available on?"
                answer="Pivoa is available on web browsers, iOS, and Android devices for seamless access anywhere."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Green */}
      <section className="py-16 bg-accent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Take Full Control of Your Financial Future Starting Today
              </h2>
              <p className="text-white/80">
                Start Taking Charge of Your Finances and Build a Better Tomorrow.
              </p>
            </div>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="h-12 px-6 bg-white text-foreground hover:bg-white/90">
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Pivoa" className="h-8 w-8 object-contain" />
                <span className="font-bold">Pivoa</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Track. Understand. Grow.
              </p>
            </div>

            {/* Links */}
            <FooterColumn title="About" links={['Partnerships', 'Terms of Use', 'Features']} />
            <FooterColumn title="Product" links={['About', 'Product', 'Features']} />
            <FooterColumn title="Resources" links={['Career', 'Blog']} />
            <FooterColumn title="Contact" links={['+123 456 780', 'Los Angeles, CA']} />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Pivoa. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Phone Mockup Component
function PhoneMockup() {
  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
        {/* Screen */}
        <div className="relative w-full h-full bg-background rounded-[2.25rem] overflow-hidden">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 py-3 text-xs">
            <span className="font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-foreground/20 rounded-sm" />
              <div className="w-4 h-2 bg-foreground/20 rounded-sm" />
              <div className="w-6 h-3 bg-foreground rounded-sm" />
            </div>
          </div>
          
          {/* App Content */}
          <div className="px-4 py-2">
            <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
            <p className="text-3xl font-bold mb-4">$4,089</p>
            
            <div className="flex gap-2 mb-4">
              <button className="flex-1 bg-foreground text-background text-xs py-2 rounded-lg font-medium">
                Payout
              </button>
              <button className="flex-1 bg-muted text-foreground text-xs py-2 rounded-lg font-medium">
                Card
              </button>
            </div>
            
            {/* Mini Chart */}
            <div className="bg-muted rounded-xl p-3 mb-3">
              <p className="text-xs text-muted-foreground mb-1">Total Payout</p>
              <p className="text-lg font-bold">$1,469</p>
              <div className="h-12 flex items-end gap-1 mt-2">
                {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-foreground/20 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-full" />
      </div>

      {/* Floating Cards */}
      <div className="absolute -right-4 top-20 bg-white rounded-xl shadow-lg p-3 border border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full" />
          <span className="text-xs text-muted-foreground">On Saves</span>
        </div>
        <p className="text-lg font-bold text-accent">$ 10,400.22</p>
      </div>

      <div className="absolute -left-8 bottom-32 bg-white rounded-xl shadow-lg p-3 border border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Expends</p>
              <p className="text-sm font-bold">$659.00</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cash Available</p>
              <p className="text-sm font-bold">$546.00</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="text-accent">▲ 5.23% vs last month</span>
          <span className="text-destructive">▼ 5.23% vs last month</span>
        </div>
      </div>
    </div>
  )
}

// Trust Logo Component
function TrustLogo({ name }: { name: string }) {
  return (
    <span className="text-lg md:text-xl font-bold tracking-tight text-foreground/60">
      {name}
    </span>
  )
}

// Savings Card Preview Component
function SavingsCardPreview() {
  return (
    <div className="relative">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg w-[280px]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium">Payon</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-1">Savings Card</p>
        <p className="text-3xl font-bold mb-6">
          $16,058<span className="text-accent">.94</span>
        </p>
        
        <p className="text-xs text-muted-foreground mb-3">Better Integration</p>
        
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-background -rotate-45" />
          </button>
          <button className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-background rotate-135" />
          </button>
          <button className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-white -rotate-45" />
          </button>
          <button className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </button>
          <button className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">•••</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Feature Check Item
function FeatureCheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <ChevronRight className="h-5 w-5 text-foreground" />
      <span className="text-muted-foreground">{text}</span>
    </li>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}

// Step Card Component
function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-xl bg-foreground text-background flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        className="flex items-center justify-between w-full py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium pr-4">{question}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <p className="pb-4 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  )
}

// Footer Column Component
function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((link, i) => (
          <li key={i}>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
