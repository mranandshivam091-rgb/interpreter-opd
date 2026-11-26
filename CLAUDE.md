# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

interpreter-opd: a voice-first, two-way interpreter for Hindi/Bhojpuri-speaking patients and
Tamil-speaking doctors in Chennai government hospital OPDs.

## Status

This repository currently contains no source code — only the README. There is no build system,
package manifest, lint config, or test suite yet. Commands and architecture notes should be added
here once the tech stack is chosen and real code exists; don't invent them in the meantime.

## Hard rules

- The app must always start with `docker compose up --build` and show its main screen with no
  API keys configured. Don't require secrets just to reach the UI.
- Never commit `.env` or any file containing secrets. Keep `.env` (and similar) in `.gitignore`.
- Keep Docker working after every change — `docker compose up --build` must succeed before
  moving on.
- Build step by step: implement one step, then stop and let the user test before starting the
  next step.
