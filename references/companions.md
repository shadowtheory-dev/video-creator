# Companion skills and libraries

The films this harness was built from used these alongside it. None is required: the harness runs on its own engine and scripts. At intake, check which of these the plan needs, see whether each is installed (`~/.claude/skills/<name>`, a local clone, or the project's `VIDEO-BRAND.md`), and give the user the install line for any that are missing. Don't install anything without asking.

## Skills

| Companion | What it adds | Phase | Install |
|---|---|---|---|
| [cinetic](https://github.com/Leonxlnx/cinetic) (MIT) | Motion craft references: transitions, camera, kinetic type, finishing, contact-sheet critique | Plan, build, review | `npx skills add Leonxlnx/cinetic` |
| [anatomy](https://github.com/wheresryan22/anatomy) (MIT) | An isometric drawing kit (`iso-kit.mjs`) for machines and devices as SVG, with light and cutaway figures | Build: drawn objects | `npx skills add wheresryan22/anatomy -g` |
| [animate](https://github.com/cth9191/animate) (MIT) | Single-file canvas pieces in a set style, with storyboard check-ins. An alternative engine for short procedural spots | Build: short spots | `/plugin marketplace add cth9191/animate`, then `/plugin install animate@animate` (needs Playwright) |
| [marketingskills](https://github.com/coreyhaines31/marketingskills) (MIT) | Copywriting and copy-editing, for on-screen lines when the brand has no approved copy for them | Plan | `npx skills add coreyhaines31/marketingskills` |

How they fit:

- **cinetic.** Read its references for craft. Its bans and default look yield to the brand profile, and this harness keeps its own `render(t)` engine.
- **anatomy.** Vendor `iso-kit.mjs` into the film folder with its licence (e.g. `vendor/anatomy/`), and build each object from a generator script. Draw objects in the brand's own style, not the kit's example.
- **animate.** Use it when a spot is one self-contained canvas piece. Its review tools need Playwright, and some need an ffmpeg built with `drawtext`.

## Sound

| Library | What it adds | Install |
|---|---|---|
| [earshot](https://github.com/Leonxlnx/earshot) (MIT) | A CPU-only sound kit for agents: renders sound-effect kits, and listens to and reviews audio | `git clone https://github.com/Leonxlnx/earshot`, then follow its README (a Python venv) |
| A track editor | Music as visible tracks, with the film playing muted against the transport and a tab per cut (see `sound.md`) | Any DAW, or a web track editor named in the brand profile |
| A sample library | Drums and instruments for the music bed | Use only samples you have the rights to |

## References and footage

| Source | Use |
|---|---|
| [Prompt Motion](https://prompt-motion.com) | Motion pieces published with their prompts. A source for the technique library: read the prompt for what each piece does, rather than watching the video |
| [Wikimedia Commons](https://commons.wikimedia.org) | Archive photos and clips. Public domain, CC0 and CC BY only (CC BY needs a credit line). Downloads are rate-limited, so fetch about one a minute |
| [Pexels](https://www.pexels.com/videos/), [Pixabay](https://pixabay.com/videos/) | Stock clips with no credit needed. Skip AI-generated clips |

## Tools the scripts need

Node with `puppeteer-core`, Google Chrome or Chromium, ffmpeg with `loudnorm`, and python3. Parallel sessions, the browser pane and Artifact review pages come from the Claude desktop app. Without it, use subagents and local pages.
