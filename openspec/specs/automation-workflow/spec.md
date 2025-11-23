# Automation Workflow

### Requirement: Process Unity Asset Task
The system SHALL provide an automated CLI task `process_unity_asset` that handles single or batch Unity resource processing.

#### Scenario: Task Trigger
- **WHEN** administrators run the Python CLI
- **THEN** the automation workflow begins for processing Unity assets

### Requirement: Resource Acquisition Stage
The system SHALL download and preprocess resources from Baidu Netdisk.

#### Scenario: Input Validation
- **WHEN** administrators provide Baidu share link and extraction code
- **THEN** the system validates and processes the input

#### Scenario: File Download
- **WHEN** valid credentials are provided
- **THEN** the script downloads files to `./temp/download/` directory using BaiduPCS tool

#### Scenario: Preprocessing
- **WHEN** compressed files are detected (.zip, .rar, .7z, .unitypackage)
- **THEN** the system extracts file lists, preview images, and identifies keywords from filenames

### Requirement: AI Content Generation
The system SHALL generate SEO-friendly content using LLM APIs.

#### Scenario: Content Input Processing
- **WHEN** file metadata is extracted
- **THEN** the system sends filename, readme content, and directory structure to LLM API

#### Scenario: SEO Content Output
- **WHEN** LLM processing completes
- **THEN** the system receives JSON containing: SEO-optimized title (English + Chinese), 300-word detailed description (Markdown), 3-5 relevant tags

### Requirement: Multi-Host Distribution
The system SHALL distribute processed resources to multiple file hosting services.

#### Scenario: Repackaging
- **WHEN** resources need branding
- **THEN** the system optionally adds promotional text `READ_ME_RESLIBS.txt` before recompression

#### Scenario: Multi-Channel Upload
- **WHEN** distribution begins
- **THEN** the system uploads to domestic channels (Chengtong/Feimaoyun) and international channels (Rapidgator/Turbobit)

#### Scenario: Link Aggregation
- **WHEN** uploads complete successfully
- **THEN** the system collects public download URLs and optionally generates short links

### Requirement: Website Publishing
The system SHALL automatically publish processed content to the CMS.

#### Scenario: Image Processing
- **WHEN** preview images are extracted
- **THEN** the system uploads them to object storage (R2/AWS S3) and obtains URLs

#### Scenario: Database Entry
- **WHEN** all metadata is ready
- **THEN** the system creates a new Post entry with: AI-generated title, AI-generated description with preview images, monetized download links, draft or published status

#### Scenario: Cleanup
- **WHEN** publishing completes
- **THEN** the system removes temporary local files

### Requirement: Error Handling
The system SHALL handle failures gracefully with appropriate retry mechanisms.

#### Scenario: Download Failure Recovery
- **WHEN** Baidu Netdisk download fails (CAPTCHA/rate limiting)
- **THEN** the system implements retry logic or sends alerts

#### Scenario: Corruption Detection
- **WHEN** file extraction fails
- **THEN** the system marks the resource as corrupted and notifies administrators