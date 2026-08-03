import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Button,
  TabGhost,
  IconButtonCircular,
  Input,
  Select,
  Checkbox,
  Radio,
  FormField,
  Switch,
  TextArea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  Badge,
  Banner,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Container,
  MeshGradient,
  NavBar,
  Footer,
  HeroBand,
  FeatureMeshBand,
  ShowcaseBand,
  LogoStrip,
  Accordion,
  AccordionItem,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Tooltip,
  Avatar,
  AvatarGroup,
  Skeleton,
  Spinner,
  Preloader,
  Toast,
  ToastContainer,
  Heading,
  Text,
  CodeBlock,
  FormGroup,
  FormRow,
  FormSection
} from '../components/UI';

const UiPreview = () => {
  const { mode, toggleTheme, isDark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [inputText, setInputText] = useState('');
  const [selectVal, setSelectVal] = useState('Option 1');
  const [toasts, setToasts] = useState([]);
  const [skeletonLoading, setSkeletonLoading] = useState(false);

  const showToast = (variant, title, description) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, variant, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Customer Logos
  const sampleLogos = [
    <span key={1} className="font-mono text-[14px] tracking-widest font-bold text-vc-body hover:text-vc-ink">GOOGLE</span>,
    <span key={2} className="font-mono text-[14px] tracking-widest font-bold text-vc-body hover:text-vc-ink">META</span>,
    <span key={3} className="font-mono text-[14px] tracking-widest font-bold text-vc-body hover:text-vc-ink">NETFLIX</span>,
    <span key={4} className="font-mono text-[14px] tracking-widest font-bold text-vc-body hover:text-vc-ink">AMAZON</span>,
    <span key={5} className="font-mono text-[14px] tracking-widest font-bold text-vc-body hover:text-vc-ink">VERCEL</span>
  ];

  // Table Data
  const tableData = [
    { id: '101', name: 'production-deployment', branch: 'main', age: '2m ago', status: 'Ready' },
    { id: '102', name: 'preview-branch-test', branch: 'staging', age: '15m ago', status: 'Building' },
    { id: '103', name: 'development-sandbox', branch: 'dev', age: '1h ago', status: 'Ready' }
  ];

  return (
    <div className="min-h-screen bg-vc-canvas-soft text-vc-ink transition-colors duration-200">
      
      {/* NavBar */}
      <NavBar
        logo={
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-vc-ink flex items-center justify-center rounded-[4px]">
              <span className="text-vc-on-primary font-bold text-[12px] font-sans">▲</span>
            </div>
            <span className="font-sans font-semibold text-[16px] tracking-tight text-vc-ink">LMS DESIGN SYSTEM</span>
          </div>
        }
        links={[
          { label: 'Overview', active: activeTab === 'Overview', onClick: () => setActiveTab('Overview') },
          { label: 'Components', active: activeTab === 'Components', onClick: () => setActiveTab('Components') },
          { label: 'Layouts', active: activeTab === 'Layouts', onClick: () => setActiveTab('Layouts') }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <Button variant="ask-ai" onClick={toggleTheme}>
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Button>
            <Button variant="signup">Deploy</Button>
          </div>
        }
      />

      {/* Hero Section */}
      <HeroBand
        eyebrow={
          <Banner onClick={() => showToast('info', 'Introduction', 'Introducing the Vercel-inspired UI Suite!')}>
            Introducing the Vercel-inspired UI Suite &rarr;
          </Banner>
        }
        title="Build and deploy on the AI Cloud."
        description="A premium Stark-designed, Vercel-inspired common UI library built inside the React LMS. Ready for high-end developer applications."
        ctas={
          <>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Interactive Modal
            </Button>
            <Button variant="secondary" onClick={() => showToast('success', 'Vercel Suite', 'Documentation page is loaded')}>
              Documentation
            </Button>
          </>
        }
      />

      {/* Logo Strip */}
      <LogoStrip logos={sampleLogos} />

      {/* Main Sandbox Showcase */}
      <Container className="py-16">
        
        {/* Buttons & Tabs Component Section */}
        <div className="mb-16">
          <h2 className="font-sans text-[24px] font-semibold tracking-[-0.96px] text-vc-ink mb-6">
            1. Buttons, Tab Pinned Rows, & Circles
          </h2>
          
          <Card variant="marketing" className="space-y-8">
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Button Scale Variations</span>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary Pill (48px)</Button>
                <Button variant="secondary">Secondary Pill (48px)</Button>
                <Button variant="primary-sm">Primary Small (36px)</Button>
                <Button variant="secondary-sm">Secondary Small (36px)</Button>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Nav/Inline CTA Variations</span>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="signup">Sign Up (28px)</Button>
                <Button variant="login">Log In (28px)</Button>
                <Button variant="ask-ai">Ask AI (28px)</Button>
                <IconButtonCircular onClick={() => showToast('info', 'Help', 'You clicked the help circular button.')}>
                  <span>?</span>
                </IconButtonCircular>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Tab-Ghost Pill Navigation Row</span>
              <div className="flex flex-wrap gap-3 bg-vc-canvas-soft p-1.5 rounded-[12px] border border-vc-hairline max-w-max">
                {['Overview', 'Deployments', 'Integrations', 'Settings'].map(tab => (
                  <TabGhost
                    key={tab}
                    active={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </TabGhost>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Inputs & Form Fields Section */}
        <div className="mb-16">
          <h2 className="font-sans text-[24px] font-semibold tracking-[-0.96px] text-vc-ink mb-6">
            2. Inputs, Selectors, & Form Layouts
          </h2>
          
          <FormSection
            title="Project settings"
            description="Manage your project settings, directory aliases, build routes, and edge server cache policies."
            footer={
              <>
                <span className="text-[12px] text-vc-mute font-sans">
                  Please save your configurations before initiating a manual deployment build.
                </span>
                <div className="flex gap-3">
                  <Button variant="login" onClick={() => showToast('info', 'Form Settings', 'Configuration reset.')}>Reset</Button>
                  <Button variant="signup" onClick={() => showToast('success', 'Form Settings', 'Configurations saved successfully!')}>Save Settings</Button>
                </div>
              </>
            }
          >
            <FormGroup>
              <FormRow columns={3}>
                <FormField 
                  label="Primary Input Field"
                  description="This input uses the standard 40px Vercel form-input styling."
                >
                  <Input 
                    size="md"
                    placeholder="Enter project name..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </FormField>

                <FormField 
                  label="Small Input Field"
                  description="Tight 32px height for inline forms."
                >
                  <Input 
                    size="sm"
                    placeholder="Query search..."
                  />
                </FormField>

                <FormField 
                  label="Large Input Field"
                  description="Generous 48px height perfect for Hero bands."
                >
                  <Input 
                    size="lg"
                    placeholder="Email address..."
                  />
                </FormField>
              </FormRow>

              <FormRow columns={2}>
                <FormField label="Standard Dropdown Select" description="Select from available deployment teams.">
                  <Select value={selectVal} onChange={(e) => setSelectVal(e.target.value)}>
                    <option>Option 1 - Development Team</option>
                    <option>Option 2 - Marketing Team</option>
                    <option>Option 3 - Global Administrator</option>
                  </Select>
                </FormField>

                <FormField label="Form Controls" description="Checkboxes and radio selections.">
                  <div className="flex space-x-6 py-2">
                    <Checkbox label="Enable Serverless Edge Functions" defaultChecked />
                    <Radio name="opt" label="Deploy instantly" defaultChecked />
                    <Radio name="opt" label="Schedule pipeline" />
                  </div>
                </FormField>
              </FormRow>

              <FormRow columns={2}>
                <FormField label="Dynamic Textarea Input" description="Enter optional multiline descriptions.">
                  <TextArea placeholder="Type comments here..." />
                </FormField>
                
                <FormField label="Toggle Switches" description="Enable/Disable edge routing rules dynamically.">
                  <div className="flex flex-col space-y-3 py-2">
                    <Switch label="Bypass cache for redirect paths" defaultChecked />
                    <Switch label="Enable analytics logs parsing" />
                  </div>
                </FormField>
              </FormRow>

              <FormField 
                label="Destructive Error State"
                error="The project name contains illegal characters. Please resolve."
              >
                <Input error placeholder="my-deploy-invalid*" />
              </FormField>
            </FormGroup>
          </FormSection>
        </div>

        {/* Cards & Badges Section */}
        <div className="mb-16">
          <h2 className="font-sans text-[24px] font-semibold tracking-[-0.96px] text-vc-ink mb-6">
            3. Adaptive Card Ladder & Badges
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card variant="marketing">
              <CardHeader>
                <h3 className="font-sans text-[18px] font-semibold text-vc-ink">Marketing Feature Card</h3>
              </CardHeader>
              <CardContent>
                Stark black-and-ink duet layout. Uses standard `card-marketing` 8px corners and Level 3 stacked shadow.
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="secondary">LMS UI</Badge>
                <span className="text-[12px] text-vc-mute font-mono">1.0.0</span>
              </CardFooter>
            </Card>

            <Card variant="soft">
              <CardHeader>
                <h3 className="font-sans text-[18px] font-semibold text-vc-ink">Soft Tint Card</h3>
              </CardHeader>
              <CardContent>
                Set on Vercel's `canvas-soft` background. No drop-shadow, perfect for grouping clusters inside a main canvas.
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="violet">Premium</Badge>
                <span className="text-[12px] text-vc-mute font-mono">Soft Layer</span>
              </CardFooter>
            </Card>

            <Card variant="template">
              <CardHeader>
                <h3 className="font-sans text-[16px] font-semibold text-vc-ink">Deploy Template Card</h3>
              </CardHeader>
              <CardContent className="text-[13px]">
                Tight 16px spacing (`template-card`) featuring an outline container and Level 2 box shadow.
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="cyan">React</Badge>
                <span className="text-[12px] text-vc-mute font-mono">Vite</span>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="pricing">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[14px] text-vc-mute uppercase tracking-wider">Hobby Plan</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <h2 className="font-sans text-[32px] font-semibold tracking-tight text-vc-ink mt-2">$0</h2>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-vc-body">Perfect for learning, personal projects, and simple prototypes.</p>
                <ul className="space-y-2 text-[14px] text-vc-body">
                  <li>&bull; Non-commercial deployments</li>
                  <li>&bull; Automatic HTTPS certificates</li>
                  <li>&bull; Faint hairline borders</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="secondary-sm" className="w-full">Get Started</Button>
              </CardFooter>
            </Card>

            <Card variant="pricing-featured">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[14px] text-vc-mute uppercase tracking-wider">Pro Plan</span>
                  <Badge variant="success">Recommended</Badge>
                </div>
                <h2 className="font-sans text-[32px] font-semibold tracking-tight text-vc-on-primary mt-2">$20</h2>
              </CardHeader>
              <CardContent className="text-vc-on-primary/80">
                <p className="mb-4">For professional developer teams who need premium features, logs, and scale.</p>
                <ul className="space-y-2 text-[14px]">
                  <li>&bull; Unlimited commercial deployments</li>
                  <li>&bull; Ambient Mesh Gradient features</li>
                  <li>&bull; Custom Domain name routing</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="secondary-sm" className="w-full bg-vc-on-primary text-vc-primary border-vc-on-primary hover:opacity-90">
                  Upgrade to Pro
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="mb-16">
          <h2 className="font-sans text-[24px] font-semibold tracking-[-0.96px] text-vc-ink mb-6">
            4. Monospace Headers & Hairline Data Table
          </h2>
          
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableCell isHeader>Deployment ID</TableCell>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Target Branch</TableCell>
                <TableCell isHeader>Created Age</TableCell>
                <TableCell isHeader>Deployment Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-[13px]">{row.id}</TableCell>
                  <TableCell className="font-medium text-vc-ink">{row.name}</TableCell>
                  <TableCell className="font-mono text-[13px]">{row.branch}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'Ready' ? 'success' : 'warning'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Accordions Showcase Section */}
        <div className="mb-16">
          <h2 className="font-sans text-[24px] font-semibold tracking-[-0.96px] text-vc-ink mb-6">
            5. Sleek Accordion Layouts (Boxed & Borderless)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Boxed Style (Level 2 Shadow)</span>
              <Accordion variant="boxed">
                <AccordionItem title="Can I deploy serverless functions?" defaultOpen>
                  Yes! Every folder deployed dynamically sets up edge and serverless environments automatically.
                </AccordionItem>
                <AccordionItem title="Does it support automatic cache validation?">
                  It utilizes stale-while-revalidate protocols to fetch background assets with zero loading lags.
                </AccordionItem>
                <AccordionItem title="How does auto scaling behave under pressure?">
                  Workloads are distributed automatically across multiple points of presence globally.
                </AccordionItem>
              </Accordion>
            </div>

            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Borderless Style (Minimalist)</span>
              <Accordion variant="borderless">
                <AccordionItem title="What frameworks are supported natively?" defaultOpen>
                  Next.js, Vite, React, Vue, Svelte, Nuxt, and static HTML templates.
                </AccordionItem>
                <AccordionItem title="Is domain redirection free?">
                  Redirections can be set up instantly with no limits or additional charges.
                </AccordionItem>
                <AccordionItem title="Do you provide analytics APIs?">
                  Developer dashboards receive analytics directly in JSON lines format via logs export.
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Interactive Tabs & Tooltips Section */}
        <div className="mb-16">
          <h2 className="font-sans text-[24px] font-semibold tracking-[-0.96px] text-vc-ink mb-6">
            6. Interactive Tab Panels & Hover Tooltips
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="marketing" className="space-y-4">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Tab Panels</span>
              <Tabs defaultValue="tab-api">
                <TabList>
                  <Tab value="tab-overview">Overview</Tab>
                  <Tab value="tab-usage">Usage</Tab>
                  <Tab value="tab-api">API Spec</Tab>
                </TabList>
                <TabPanel value="tab-overview">
                  <p className="text-vc-body text-[14px]">
                    The **Tabs** component handles navigation tabs seamlessly using context hooks and active outline highlight transitions.
                  </p>
                </TabPanel>
                <TabPanel value="tab-usage">
                  <p className="text-vc-body text-[14px]">
                    Configure tabs simply by wrapping list items inside the TabList block. Switch panels dynamically with matching value anchors.
                  </p>
                </TabPanel>
                <TabPanel value="tab-api">
                  <p className="text-vc-body text-[14px] font-mono text-[13px] text-vc-link">
                    GET /api/v1/deployments/:id
                  </p>
                </TabPanel>
              </Tabs>
            </Card>

            <Card variant="marketing" className="space-y-6">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Hover Tooltips</span>
              <div className="flex flex-col space-y-4">
                <p className="text-[14px] text-vc-body leading-relaxed">
                  Hover over the highlighted phrases below to view the Vercel-style tooltip placements in action:
                </p>
                <div className="flex flex-wrap gap-4 py-2">
                  <Tooltip content="Tooltip content on Top" placement="top">
                    <span className="cursor-help pb-0.5 border-b border-dashed border-vc-mute text-vc-ink font-medium">Top Placement</span>
                  </Tooltip>
                  <Tooltip content="Tooltip content on Bottom" placement="bottom">
                    <span className="cursor-help pb-0.5 border-b border-dashed border-vc-mute text-vc-ink font-medium">Bottom Placement</span>
                  </Tooltip>
                  <Tooltip content="Tooltip content on Left" placement="left">
                    <span className="cursor-help pb-0.5 border-b border-dashed border-vc-mute text-vc-ink font-medium">Left Placement</span>
                  </Tooltip>
                  <Tooltip content="Tooltip content on Right" placement="right">
                    <span className="cursor-help pb-0.5 border-b border-dashed border-vc-mute text-vc-ink font-medium">Right Placement</span>
                  </Tooltip>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Avatars, Toasts, Skeletons, & Spinners Section */}
        <div className="mb-16">
          <h2 className="font-sans text-[24px] font-semibold tracking-[-0.96px] text-vc-ink mb-6">
            7. Avatars, Interactive Toasts, & Loading Feedbacks
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="marketing" className="space-y-6">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Avatars & Overlap Groups</span>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar initials="JD" size="xs" />
                  <Avatar initials="VC" size="sm" />
                  <Avatar initials="AI" size="md" />
                  <Avatar initials="ST" size="lg" />
                  <Avatar initials="PR" size="xl" />
                </div>
                <AvatarGroup limit={3}>
                  <Avatar initials="AA" />
                  <Avatar initials="BB" />
                  <Avatar initials="CC" />
                  <Avatar initials="DD" />
                  <Avatar initials="EE" />
                </AvatarGroup>
              </div>
            </Card>

            <Card variant="marketing" className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Toasts Notifications</span>
                <span className="text-[11px] text-vc-link font-medium">Click to Trigger</span>
              </div>
              <div className="flex flex-col space-y-2">
                <Button variant="secondary-sm" className="w-full text-left justify-start" onClick={() => showToast('success', 'Operation Success', 'Edge configs updated successfully!')}>
                  🚀 Success Toast
                </Button>
                <Button variant="secondary-sm" className="w-full text-left justify-start" onClick={() => showToast('warning', 'Billing Warning', 'Your domain is expiring soon!')}>
                  ⚠️ Warning Toast
                </Button>
                <Button variant="secondary-sm" className="w-full text-left justify-start" onClick={() => showToast('error', 'Deployment Error', 'Vite build compilation failed!')}>
                  🚨 Error Toast
                </Button>
              </div>
            </Card>

            <Card variant="marketing" className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Skeletons & Spinners</span>
                <Button variant="ask-ai" className="h-[20px] px-2 text-[10px]" onClick={() => setSkeletonLoading(!skeletonLoading)}>
                  Toggle Loader
                </Button>
              </div>
              
              <div className="space-y-4 min-h-[92px]">
                {skeletonLoading ? (
                  <div className="space-y-3">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rect" height={32} />
                  </div>
                ) : (
                  <div className="flex items-center space-x-6">
                    <Spinner size="md" />
                    <div className="border-l border-vc-hairline pl-4">
                      <Preloader text="Processing logs..." className="p-0 space-y-1.5" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Typography, Headings, and Code Block Section */}
        <div className="mb-16">
          <h2 className="font-sans text-[24px] font-semibold tracking-[-0.96px] text-vc-ink mb-6">
            8. Typography Scale & Code Snippets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="marketing" className="md:col-span-2 space-y-6">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">Typography scale</span>
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] text-vc-mute block mb-1">Heading display-lg</span>
                  <Heading variant="display-lg">Develop. Preview. Ship.</Heading>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-vc-mute block mb-1">Heading display-sm</span>
                  <Heading variant="display-sm">Modern web applications infrastructure</Heading>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-vc-mute block mb-1">Text body-md</span>
                  <Text variant="body-md">This is body text. Sleek, clean and highly readable Inter geometric font styling.</Text>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-vc-mute block mb-1">Text caption</span>
                  <Text variant="caption">Copyright &copy; 2026 Developer System. All rights reserved.</Text>
                </div>
              </div>
            </Card>

            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[12px] text-vc-mute uppercase tracking-wider">JSON Code Block</span>
              <CodeBlock 
                filename="vercel.json"
                code={`{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}`}
              />
            </div>
          </div>
        </div>

      </Container>

      {/* Feature Mesh Band */}
      <FeatureMeshBand
        title="A compute model for all workloads."
        description="Vercel dynamically scales serverless APIs, Edge middleware, and persistent execution contexts. You only pay for what you use."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="marketing">
            <h3 className="font-sans text-[18px] font-semibold mb-2">Zero-Config Pipelines</h3>
            <p className="text-vc-body text-[14px]">Push your branch to GitHub or GitLab, and the cloud will compile and distribute your assets to millions of edge servers globally.</p>
          </Card>
          <Card variant="marketing">
            <h3 className="font-sans text-[18px] font-semibold mb-2">Real-time Web Analytics</h3>
            <p className="text-vc-body text-[14px]">Measure your core web vitals directly from real client devices, without loading cookies or tracking scripts.</p>
          </Card>
        </div>
      </FeatureMeshBand>

      {/* Showcase ShowcaseBands */}
      <ShowcaseBand themeMode="light">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="font-sans text-[32px] font-semibold tracking-[-1.28px] mb-4">Deploy in seconds.</h2>
          <p className="text-vc-body mb-6">Our platform connects directly with GitHub to spin up branch deployments on every git commit push.</p>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>Launch UI Sandbox</Button>
        </div>
      </ShowcaseBand>

      <ShowcaseBand themeMode="dark">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-sans text-[32px] font-semibold tracking-[-1.28px] text-white mb-4">
              Dark night mode tratamiento.
            </h2>
            <p className="text-white/70 mb-6">
              When a section calls for the dark mode polarity-flip, the entire band swaps its style hierarchy to Stark ink background, hairline lines, and white text.
            </p>
            <div className="flex gap-4">
              <Button variant="primary-sm" className="bg-white text-black border-white hover:opacity-90">
                Light Primary
              </Button>
              <Button variant="secondary-sm" className="bg-transparent text-white border-white/20 hover:bg-white/10">
                Flipped Secondary
              </Button>
            </div>
          </div>
          
          {/* Mock Code Editor */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[8px] p-6 font-mono text-[13px] text-green-400 vc-shadow-l4">
            <div className="flex items-center space-x-1.5 mb-4 border-b border-white/5 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              <span className="text-[12px] text-white/40 ml-2">vercel-deploy.sh</span>
            </div>
            <p className="text-white/60">$ npm install --global vercel</p>
            <p className="text-white/60">$ vercel deploy</p>
            <p className="text-[#3291ff] font-medium">&gt; Deploying React app to Vercel Edge...</p>
            <p className="text-green-500 font-semibold">&gt; Success! Ready on https://lms-design.vercel.app</p>
          </div>
        </div>
      </ShowcaseBand>

      {/* Footer */}
      <Footer
        columns={[
          {
            title: 'Solutions',
            links: [
              { label: 'Edge Functions', onClick: () => {} },
              { label: 'Dynamic Server Rendering', onClick: () => {} },
              { label: 'Image Optimization', onClick: () => {} },
              { label: 'Global CDN Network', onClick: () => {} }
            ]
          },
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', onClick: () => {} },
              { label: 'Design System Spec', onClick: () => {} },
              { label: 'Geist Font Family', onClick: () => {} },
              { label: 'Open Source substitute', onClick: () => {} }
            ]
          },
          {
            title: 'Company',
            links: [
              { label: 'About Brand', onClick: () => {} },
              { label: 'Developer Careers', onClick: () => {} },
              { label: 'Edge Blog', onClick: () => {} },
              { label: 'Privacy Policy', onClick: () => {} }
            ]
          },
          {
            title: 'Support',
            links: [
              { label: 'Contact Sales', onClick: () => {} },
              { label: 'Edge Health Status', onClick: () => {} },
              { label: 'Developer Forums', onClick: () => {} },
              { label: 'Ask LMS AI', onClick: () => {} }
            ]
          }
        ]}
        bottomContent={
          <>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-vc-ink flex items-center justify-center rounded-[3px]">
                <span className="text-vc-on-primary font-bold text-[10px] font-sans">▲</span>
              </div>
              <span className="text-[14px] text-vc-ink font-semibold">LMS Design Spec.</span>
            </div>
            <span className="text-[12px] text-vc-mute">
              &copy; {new Date().getFullYear()} Vercel-inspired Developer Canvas. All rights reserved.
            </span>
          </>
        }
      />

      {/* Interactive Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Vercel UI Sandbox Portal"
      >
        <div className="space-y-4">
          <p>This is a modal portal dialog overlay rendered using clean absolute backdrops, stacked shadow level 5, and responsive rounded borders.</p>
          <FormField label="Dynamic Feedback Text">
            <Input 
              placeholder="Type comments for developer..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </FormField>
          <div className="flex space-x-3 pt-3 justify-end">
            <Button variant="secondary-sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary-sm" onClick={() => {
              showToast('success', 'Feedback Received', `Feedback saved: ${inputText}`);
              setIsModalOpen(false);
            }}>
              Submit Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification Mount */}
      <ToastContainer placement="bottom-right">
        {toasts.map(t => (
          <Toast
            key={t.id}
            variant={t.variant}
            title={t.title}
            description={t.description}
            onClose={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
          />
        ))}
      </ToastContainer>

    </div>
  );
};

export default UiPreview;
