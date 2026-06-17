# Gym Owner Analytics Dashboard Documentation

This document outlines the architecture, layout design, data calculations, and business intelligence logic implemented for the **Owner Analytics** dashboard in FitZone BMI Tracker.

## Overview
The Owner Analytics page is designed to give gym owners a high-level operational overview of member growth, staff allocation, and diagnostic scan coverage, alongside aggregate fitness health analytics of their members.

---

## 1. Key Performance Indicators (KPIs)

The dashboard presents four primary KPI metrics calculated in real-time:

### Active Membership Rate
- **Formula**: `(Active Members / Total Members) * 100`
- **Purpose**: Measures member retention and gym utilization.
- **Healthy Threshold**: `> 80%` (indicated in green). Underperforming rates highlight a need for outreach campaigns.

### Diagnostic Scan Coverage
- **Formula**: `(Monthly Analyses / Active Members) * 100`
- **Purpose**: Measures trainer activity and diagnostic usage. A body composition scanner is only useful if members get scanned regularly (ideally, once per month).
- **Healthy Threshold**: `> 50%`. If scan coverage drops below 50%, the system flags a warning indicating that trainers/staff need to schedule monthly assessments.

### Gym Success Rate
- **Formula**: `(Members with Normal BMI / Total Members with a BMI record) * 100`
- **Purpose**: Evaluates the efficacy of the gym's diet and workout regimens. A higher rate indicates a healthier gym community and verifies trainer performance.

### Staff Coverage Ratio
- **Formula**: `Active Members / Total Active Staff`
- **Purpose**: Evaluates staff workload and whether the gym is understaffed.

---

## 2. Interactive Charting System

The dashboard utilizes **Recharts** to render beautiful, responsive SVG visualizations tailored to the gym's dark mode and custom HSL color palette.

### BMI Category Distribution (Donut Chart)
- **Endpoint**: `/api/v1/analytics/bmi-distribution`
- **Visuals**: A double-ring donut chart mapping members to their latest BMI categories.
- **Categories**: Underweight, Normal, Overweight, Obese Class 1, Obese Class 2, Obese Class 3.
- **Interactive Legend**: Displays a breakdown of count and percentage contribution for each category on hover/focus.

### Weight Loss Trends (Area Chart with Time-frame Selector)
- **Endpoint**: `/api/v1/analytics/weight-trends?days=N`
- **Query Filter**: Users can select between `7 Days`, `30 Days`, `90 Days`, and `180 Days`. Selecting a filter triggers a dynamic fetch request updating the chart state.
- **Visuals**: A smooth area chart with a gradient fill showing the change in average member weight (in kg) over time, validating that the overall gym population is moving in the desired direction.

### Member Acquisition (Bar Chart)
- **Endpoint**: `/api/v1/analytics/member-growth`
- **Visuals**: Vertical bars mapping monthly registrations over the past six months, enabling owners to track seasonality in signups.

---

## 3. Trainer Workload & Performance Hub

To assist owners with staff resource allocation, the dashboard aggregates member assignments.

- **Calculation**: Fetches all trainers (`/trainers`) and links them with the active members list (`/members?limit=100`) by matching `trainerId`.
- **Workload Status Metric**:
  - `0 Members`: **Idle** (Muted Slate) — Indicates the trainer can accept new clients.
  - `1 - 10 Members`: **Optimal** (Green) — Balanced client load.
  - `11 - 20 Members`: **Busy** (Yellow) — High workload, monitor client satisfaction.
  - `> 20 Members`: **Overloaded** (Red) — Trainer has too many clients. Assign new members to other trainers.

---

## 4. Rules-Based Insights Engine

A smart, contextual recommendations box is computed client-side based on aggregate fitness and operational metrics.

| Trigger Condition | Insight Level | Message / Action Recommendation |
| :--- | :--- | :--- |
| **Overweight + Obese Rate > 50%** | Warning | **Launch Cardio/Weight-Loss Campaigns**: A high percentage of members are in overweight categories. We recommend introducing more cardio bootcamps and high-intensity interval training (HIIT) classes. |
| **Underweight Rate > 15%** | Info | **Promote Hypertrophy & Bulking Plans**: A significant portion of members are underweight. Encourage trainers to design strength/muscle mass templates and high-calorie diet plans. |
| **Scan Coverage < 50%** | Caution | **Increase Scan Activity**: Less than half of active members have received a body composition scan this month. Prompt staff to schedule monthly analyses during member workouts. |
| **Gym Success Rate > 60%** | Success | **Excellent Fitness Outcomes**: Over 60% of your members maintain a healthy BMI! Use these statistics in marketing materials to showcase real results. |
