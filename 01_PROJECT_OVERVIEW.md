# 01 — Project Overview

## What This Project Is

**PantawidAral** is a dropout risk prediction and intervention support tool. It is built for DSWD (Department of Social Welfare and Development) social workers — specifically the role called **Municipal Link** — who manage families enrolled in the 4Ps program (Pantawid Pamilyang Pilipino Program), the Philippines' largest anti-poverty conditional cash transfer initiative.

## The Problem

Each year in the Philippines, an estimated 100,000 to 130,000 children drop out of basic education. Dropout clusters heavily in the lowest income quintile and is more than four times higher in poor families than in wealthy ones. Once a child drops out, their lifetime earning potential, access to formal employment, and ability to support their own future children's education collapse.

The Philippines has built a serious system to prevent this — 4Ps with its conditional cash transfers and its network of approximately 1,200 Municipal Links — but the system is reactive. Social workers find out a child has dropped out *after* it happens. By then, intervention efficacy collapses.

The data that would predict dropout in time exists. It just arrives at the wrong people, at the wrong time, in unusable form.

## The Insight

Dropout is predictable from existing data. The problem is not a resource gap or a data gap. It is an **information routing problem**: the right signal is not reaching the right person early enough.

## The Solution

PantawidAral predicts which children in a Municipal Link's caseload are at high risk of dropping out within the next 90 days, explains the prediction in the language of social casework, and recommends specific interventions — routed only to the social worker, never to schools or teachers.

The architectural decision that defines the product: **predictions are accessible only to people who can use them helpfully**. Schools cannot see them. Teachers cannot see them. This refusal is enforced at the data layer and is the central differentiation of the system.

## Who It Serves

**Primary user:** Ate Marivic Santos, a Municipal Link based in San Pedro, Laguna. She manages 247 4Ps families. She uses a basic laptop in her municipal office and a smartphone in the field.

**Protected subjects:** The 4Ps children and their families. They are not direct users. They are protected by the architectural access constraint that governs how predictions about them are routed.

This dual structure — primary user vs. protected subject — is intentional and is part of what makes the ethical design coherent.

## Why The Philippines

4Ps is one of the most data-rich anti-poverty programs in any developing country. DSWD already collects household assessments, monitors compliance, and updates records regularly. The data infrastructure that this prediction system requires is already partially built. The country has invested in the apparatus. PantawidAral is the analytic layer on top of an infrastructure that already exists.

## The One-Line Purpose

**Give social workers foresight about which 4Ps children are about to drop out, route that information only to people equipped to help, and never to people who could harm.**

## What It Is Not

- Not a replacement for the social worker; the model produces predictions, the worker makes decisions
- Not a school-facing tool; schools have no access by design
- Not a real-time surveillance system; uses already-collected DSWD records
- Not a complete poverty intervention; one leverage point in a larger system
- Not a generic dropout prediction tool that happens to be in the Philippines; built specifically for the 4Ps program structure

## The Pitch Frame

Opening line of the pitch:

> *"Mark is 14. He lives in San Pedro, Laguna. He hasn't been to school in three weeks. Right now, no one in any system knows that this is the beginning of his dropout. By the time anyone knows, it will be too late to bring him back. We built the layer that knows in time, and routes that knowledge only to the one person who can help."*

That frame should inform every design decision. The product exists to make Mark visible to Marivic — and only to Marivic — before it is too late.
