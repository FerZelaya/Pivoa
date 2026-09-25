import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Receipt, 
  PieChart, 
  Camera, 
  Shield, 
  Zap,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pivoa" className="h-10 w-10 object-contain" />
            <span className="font-bold text-xl text-primary">Pivoa</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="Pivoa" className="h-24 w-24 object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Track. Understand.{' '}
              <span className="text-primary">Grow.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Pivoa is your smart personal finance companion. Track expenses manually or let AI scan your receipts. Get insights that help you grow financially.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage your money
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple yet powerful tools to help you understand your spending habits and make better financial decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Manual Entry</h3>
                <p className="text-muted-foreground">
                  Quickly log expenses with our intuitive form. Add vendor, amount, category, and notes in seconds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Receipt Scanning</h3>
                <p className="text-muted-foreground">
                  Snap a photo of your receipt and let AI extract the details automatically. Review and save with one tap.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-accent/20 w-12 h-12 flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
                <p className="text-muted-foreground">
                  Beautiful charts and insights show where your money goes. Track trends and set better budgets.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Built for speed. Log expenses in under 5 seconds. No waiting, no friction.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your data is encrypted and never shared. We use bank-level security to protect your information.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-accent/20 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Growth Focused</h3>
                <p className="text-muted-foreground">
                  More than tracking — understand patterns and take control of your financial growth journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
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
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Account</h3>
                <p className="text-muted-foreground">
                  Sign up in seconds with just your email and password.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Log Expenses</h3>
                <p className="text-muted-foreground">
                  Add expenses manually or scan receipts with your camera.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Grow</h3>
                <p className="text-muted-foreground">
                  Understand your patterns and make smarter financial decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Your security is our priority
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  We take the protection of your financial data seriously. Pivoa is built with security-first principles.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">End-to-end encryption</span>
                      <p className="text-sm text-muted-foreground">All data is encrypted in transit and at rest</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">No data selling</span>
                      <p className="text-sm text-muted-foreground">We never sell or share your personal data</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Secure authentication</span>
                      <p className="text-sm text-muted-foreground">Industry-standard auth with secure sessions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Regular security audits</span>
                      <p className="text-sm text-muted-foreground">Continuous monitoring and updates</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <Shield className="relative h-48 w-48 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have questions? We've got answers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <FAQItem 
              question="Is Pivoa free to use?"
              answer="Yes! Pivoa is completely free to use for personal expense tracking. We may introduce premium features in the future, but the core functionality will always be free."
            />
            <FAQItem 
              question="How does the receipt scanning work?"
              answer="Simply take a photo of your receipt or upload an image. Our AI analyzes the receipt and extracts the vendor, amount, date, and suggests a category. You can review and edit before saving."
            />
            <FAQItem 
              question="Is my financial data secure?"
              answer="Absolutely. We use industry-standard encryption for all data, both in transit and at rest. Your data is stored securely and we never share it with third parties."
            />
            <FAQItem 
              question="Can I export my data?"
              answer="Yes, you can export all your expense data at any time. Your data belongs to you, and you should always have access to it."
            />
            <FAQItem 
              question="What currencies are supported?"
              answer="Pivoa supports all major world currencies. You can log expenses in any currency and our dashboard will display insights accordingly."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already tracking, understanding, and growing with Pivoa.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Pivoa" className="h-8 w-8 object-contain" />
              <span className="font-semibold text-primary">Pivoa</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Track. Understand. Grow. &copy; {new Date().getFullYear()} Pivoa. All rights reserved.
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        className="flex items-center justify-between w-full py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <p className="pb-4 text-muted-foreground">
          {answer}
        </p>
      )}
    </div>
  )
}
