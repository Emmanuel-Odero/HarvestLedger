# Blockchain Showcase Dashboard Components

This directory contains interactive dashboard components that demonstrate the agricultural blockchain platform's capabilities using realistic demo data.

## Components

### 1. LiveHCSTopicViewer

Displays real-time harvest records from Hedera Consensus Service (HCS) with blockchain verification.

**Features:**

- Real-time message streaming from HCS topics
- Blockchain verification badges
- Message detail modal with transaction information
- Auto-refresh capability
- Educational tooltips explaining HCS benefits
- GPS verification indicators
- IoT sensor data badges
- Certification tracking

**Props:**

```typescript
interface LiveHCSTopicViewerProps {
  topicId?: string; // HCS topic ID (default: '0.0.1001')
  demoMode?: boolean; // Enable demo mode (default: true)
  realTimeUpdates?: boolean; // Auto-refresh messages (default: false)
  limit?: number; // Number of messages to display (default: 10)
}
```

**Usage:**

```tsx
import { LiveHCSTopicViewer } from "@/components/dashboard";

<LiveHCSTopicViewer
  topicId="0.0.1001"
  demoMode={true}
  realTimeUpdates={false}
  limit={10}
/>;
```

### 2. SupplyChainVisualization

Interactive visualization mapping crop journey from farm to consumer with blockchain verification at each step.

**Features:**

- Visual timeline of supply chain stages
- Interactive stage selection
- GPS-verified location tracking
- Blockchain verification badges
- IoT sensor data display (temperature, humidity, quality scores)
- Ownership transfer history
- Stage-specific details modal
- Educational tooltips

**Props:**

```typescript
interface SupplyChainVisualizationProps {
  cropBatchId?: string; // Specific crop batch to display
  showVerificationBadges?: boolean; // Show blockchain verification (default: true)
  interactiveMode?: boolean; // Enable interactive features (default: true)
}
```

**Usage:**

```tsx
import { SupplyChainVisualization } from "@/components/dashboard";

<SupplyChainVisualization
  showVerificationBadges={true}
  interactiveMode={true}
/>;
```

### 3. TokenizationInterface

Interface for managing crop batches as HTS (Hedera Token Service) tokens with marketplace integration.

**Features:**

- Token portfolio view
- Available crop batches for tokenization
- One-click tokenization workflow
- Token detail modal with quality metrics
- Certification display
- Transfer and marketplace actions
- Crop type filtering (coffee, maize, wheat)
- Educational tooltips explaining tokenization benefits

**Props:**

```typescript
interface TokenizationInterfaceProps {
  walletConnected?: boolean; // Wallet connection status (default: true)
  demoMode?: boolean; // Enable demo mode (default: true)
}
```

**Usage:**

```tsx
import { TokenizationInterface } from "@/components/dashboard";

<TokenizationInterface walletConnected={true} demoMode={true} />;
```

### 4. QualityAssuranceDisplay

Comprehensive quality assurance dashboard with IoT sensor data and certification tracking.

**Features:**

- Overall quality score with visual indicators
- Quality metrics grid (moisture, defects, screen size, protein)
- GPS verification status
- Real-time IoT sensor monitoring (temperature & humidity)
- Active certifications display
- Historical sensor data visualization
- Export and sharing capabilities
- Educational tooltips

**Props:**

```typescript
interface QualityAssuranceDisplayProps {
  tokenId?: string; // Specific token to display
  showIoTData?: boolean; // Show IoT sensor data (default: true)
  showCertifications?: boolean; // Show certifications (default: true)
}
```

**Usage:**

```tsx
import { QualityAssuranceDisplay } from "@/components/dashboard";

<QualityAssuranceDisplay showIoTData={true} showCertifications={true} />;
```

## Complete Dashboard Example

See `frontend/app/dashboard/blockchain-showcase/page.tsx` for a complete implementation that combines all components into a tabbed interface.

## Data Sources

All components use the `DemoDataService` from `@/lib/demo-data-service` which provides:

- 50+ realistic farm entities
- Comprehensive transaction histories
- HCS messages with harvest records
- HTS tokens with quality metrics
- IoT sensor data (temperature, humidity)
- GPS-verified locations
- Certifications and quality grades

## Styling

Components use:

- Tailwind CSS for styling
- shadcn/ui components (Card, Badge, Button, Tabs)
- Responsive design for mobile and desktop
- Consistent color scheme with semantic colors
- Accessibility-compliant markup

## Educational Features

Each component includes educational tooltips that explain:

- Why blockchain technology is valuable
- How specific features work
- Benefits for farmers and buyers
- Technical concepts in simple terms

## Interactive Features

- Click on messages/stages/tokens for detailed views
- Filter by crop type
- Auto-refresh for real-time updates
- Token selection dropdowns
- Expandable detail modals
- Action buttons for common workflows

## Requirements Validation

These components satisfy the following requirements from the spec:

- **4.1**: Live HCS topic viewer displaying real-time harvest records ✓
- **4.2**: Supply chain visualization with blockchain verification badges ✓
- **4.3**: Tokenization interface showing crop batches as HTS assets ✓
- **4.4**: Educational tooltips explaining blockchain value ✓
- **5.1**: Marketplace integration (token listing actions) ✓
- **5.2**: Transparent pricing and provenance display ✓
- **8.2**: Educational tooltips throughout ✓

## Future Enhancements

Potential improvements:

- Real-time WebSocket updates for live mode
- Advanced filtering and search
- Data export in multiple formats
- Integration with actual Hedera testnet
- Mobile-optimized views
- Accessibility improvements
- Multi-language support
