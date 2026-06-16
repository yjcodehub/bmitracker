# Phase 5 UI Screen Reference Layouts

All configuration dashboards are built under `/owner/settings` for Gym Owners using clean styling guidelines, responsive grids, and real-time state sync.

---

### 1. Theme Configuration Layout
- **Path:** `/owner/settings/theme`
- **Interface Structure:**
  - **Left Section (Form):** Input text fields for gym name and footer notice. Side-by-side color picker swatches for brand primary and secondary hues. File upload zone with drag-and-drop support showing logo thumbnail preview.
  - **Right Section (Live Mock Preview):** Sticky frosted-glass card that renders a scaled mockup of the mobile dashboard. As the owner updates colors, inputs text, or uploads a logo, the preview styles update instantly to reflect their changes.

### 2. BMI Classification Matrix
- **Path:** `/owner/settings/bmi-rules`
- **Interface Structure:**
  - **Header Controls:** Actions to "Reset Defaults" (reverts to standard WHO ranges with confirmation) and "Add Row" (inserts a blank category at the bottom).
  - **Rule Table:** Inline editable grid with form fields for numeric range limits (`min` / `max`), category display name, and text fields for diagnostic risks and actions. Action column includes a deletion icon to clean up custom thresholds.

### 3. Body Composition Configurations
- **Path:** `/owner/settings/body-rules`
- **Interface Structure:**
  - **Metric Group Cards:** Segmented grid layout isolating Visceral Fat limits (normal/high/risk) and Trunk Fat percentage thresholds.
  - **Gender-Specific Sub-Panels:** Color-coded panels (Blue header for Males, Pink header for Females) displaying body fat percent parameters (split across normal, high, and risk ranges), muscle mass normal bounds, and reference BMR values.

### 4. Email Settings & SMTP Validation
- **Path:** `/owner/settings/email`
- **Interface Structure:**
  - **Left Panel:** Toggle switch cards enabling or disabling individual welcome registrations, BMI analysis reports, and notification alerts.
  - **Right Panel (SMTP Config):** Secure login credentials fields. If credentials exist, the password displays masked (`••••••••`).
  - **Actions:** "Test Connection" button triggers asynchronous SMTP verification. Success triggers a green check notification; errors pop up an alert displaying raw SMTP error details.

### 5. Role and Permission Mapping
- **Path:** `/owner/settings/roles`
- **Interface Structure:**
  - **Left Sidebar:** A card feed displaying all custom and system roles (marked with distinct category badges).
  - **Right Editor Card:** Active role editor displaying name/description inputs, action helpers to "Select All" or "Deselect All", and a checkbox grid categorized by resource type (e.g. Member actions, BMI actions, Settings actions). System roles disable form inputs to prevent corruption.

### 6. Staff Management Console
- **Path:** `/owner/settings/staff`
- **Interface Structure:**
  - **Toolbar:** Global text search input filter and "Add Staff Member" action.
  - **Directory Table:** Responsive list displaying staff name, login emails, phone numbers, role badges, and status pills.
  - **User Modal:** A popup overlay hosting full creation/edit details including role assigners and status togglers.

### 7. Audit Log Viewer Timeline
- **Path:** `/owner/settings/audit`
- **Interface Structure:**
  - **Filter Toolbar:** Collapsible selector parameters allowing filtering by action categories, target resource types, or date bounds.
  - **Timeline Feed:** List cards summarizing chronological operations. The action label is color-coded (green for Create, blue for Update, red for Delete).
  - **Collapsible Node:** Clicking details expands request details showing request path methods, browser user-agents, and resource database IDs.
