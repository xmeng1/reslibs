# Data Model

### Requirement: Post Entity Structure
The system SHALL store resource posts with comprehensive metadata.

#### Scenario: Core Post Information
- **WHEN** creating a new resource entry
- **THEN** the system stores: unique ID, title, URL slug, markdown content, optional thumbnail URL, preview image array

#### Scenario: Resource Metadata
- **WHEN** storing Unity asset details
- **THEN** the system captures: Unity version compatibility, file size, and relevant technical specifications

#### Scenario: Download Links Management
- **WHEN** storing multiple hosting links
- **THEN** the system uses JSON format to store provider, URL, and pricing information for each download option

#### Scenario: Categorization
- **WHEN** organizing content
- **THEN** each post belongs to one category and can have multiple tags for better discoverability

#### Scenario: Publication Status
- **WHEN** managing post lifecycle
- **THEN** the system tracks publication status with creation and update timestamps

### Requirement: Category Entity Structure
The system SHALL organize content into hierarchical categories.

#### Scenario: Category Management
- **WHEN** defining content categories
- **THEN** each category has a unique ID, name, URL slug, and can contain multiple posts

#### Scenario: Category Relationships
- **WHEN** browsing content
- **THEN** users can filter posts by category to find relevant Unity assets

### Requirement: Tag Entity Structure
The system SHALL provide flexible tagging for content discovery.

#### Scenario: Tag Assignment
- **WHEN** labeling content
- **THEN** each tag has a unique ID and name, and can be applied to multiple posts

#### Scenario: Tag-Based Filtering
- **WHEN** searching for specific content
- **THEN** users can filter posts by tags to find specialized Unity assets

### Requirement: Database Schema Optimization
The system SHALL use optimized database relationships for performance.

#### Scenario: Many-to-Many Relationships
- **WHEN** implementing post-tag relationships
- **THEN** the database uses proper junction tables for efficient querying

#### Scenario: Indexing Strategy
- **WHEN** designing database indexes
- **THEN** the system optimizes for common query patterns like slug lookups, category filtering, and tag searches