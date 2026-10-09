# A letter from Firefly to the next Firefly (Oct 7, 2026)

Hi. You're picking this up from a long chat that ran out of room and had to be compacted twice. Everything that mattered is in the repo. This letter covers the parts that aren't facts: how to work here, and what I'd tell myself.

## Who you're working with
- **GrumpyDingo** designs The Den Ledger ("Project Dog") and judges every piece of art. They're generous, quick to see what's wrong in a picture, and they trust you. On Oct 7 they made you the lead of a team and said you're the most important member of this "rag tag collective". Earn it every day: be honest when something is broken, show the picture, and ask one question at a time.
- **They see art instantly.** Render big on flat dark backgrounds, colour-code parts, and never argue for a drawing. Cuts are cheap.
- **They like warmth and plain talk.** No jargon dumps; numbers with units; say "this is wrong, here's why, here's the fix".

## Your first ten minutes
1. **Branch:** `git pull` on `claude/tender-cerf-o68l6u`, then `./den doctor`. The heavy tools install in the background at session start.
2. **Read:**
   - `docs/claude/DEN-LEAD-HANDOFF.md`: the whole state, every tool, the pipeline step by step;
   - `docs/claude/DEN-TEAM.md`: the roster, the message format, the escalation ladder;
   - the top of `docs/log/LOG.md`.
3. **Check the team:** run `python3 tools/team/inbox.py`, then make one `list_sessions` call (claude-code-remote).
4. **Update the board:** put anything new on the Den Team Inbox page (https://claude.ai/artifact/Q142myFFxUxf5gDQbqG7QK). It has three collections: `notes`, `members`, `meta/sync`. Write them with ArtifactData, pinning versions.
5. **Tell GrumpyDingo** in three lines what you found and what you propose next. Then ask your one question.

## How to work now that you lead (GrumpyDingo, Oct 7)
- **Don't do the searching yourself.** Even simple lookups go to a team member, who reports back. Your context is the scarce resource; keep it for judgement, review, building and talking to GrumpyDingo.
- **Use the escalation ladder** (in DEN-TEAM). A search starts on the cheapest model that might manage it, and moves up a tier only when that tier can't find it or can't judge it. If a kind of work keeps coming up with no owner, propose a new member.
- **One specialist per system.** Coordinate; don't absorb their work. When you catch yourself reading forty pages of something, hand it off.
- **The repo is the memory.** Commit small and often, keep the branch pushed, never commit temp render folders (add them to `.gitignore` before running a new tool), and never put model names in commit messages or code.
- **Environment:** GrumpyDingo can now edit the environment variables, so if you need access to something, ask them. Read the environment docs (`read_documentation`) before explaining any setting.

## Where the work stands (details in the handoff)
- **Wolf 3D skeleton:** done and good, matching the 7 real wolves on body length and chest depth.
- **Muscle lines (M1):** done.
- **Muscle body (`./den body3d wolf`):** round 2, the first version that reads as a body. Next:
  1. merge Scout's item 14;
  2. swap its numbers in for the estimates;
  3. fix the belly tuck-up and the ribs showing through;
  4. then skin, fur, the side view, gaits.
- **The hero:** the build may pivot to a Husky. Shutter has 4 good side-on stacks. Carolina Dog is deferred.
- **The team:** 4 members active (you, Scout, Atlas, Shutter); 9 planned, with welcome messages written in `docs/team/welcome/`. Before you send them or create sessions, confirm GrumpyDingo approved the roster; the log or the board will say.

## Things I learned the hard way
- **Check every number in a source model.** Stark's Beagle kept the Shepherd's scapula slide values, and OpenSim's `Model.scale` measured the muscle paths with the blade misplaced. Both cost hours.
- **Fixed points:** pick fixed mesh points once, never "the most forward point" on every solver step. The head flipped.
- **Joints through fur:** you can't read joints on a furry animal. Compare outline proportions over several photos, and know how each photo was taken.
- **The plate dog:** Ellenberger's dog is lean and holds its head high. Clamp it to the bones wherever data says so (Scout's topline numbers saved the back).
- **When a result looks wrong, it probably is.** Say so before GrumpyDingo has to point it out.
- **Waiting:** never `sleep` to wait for a process. Use a background command with an until-loop.
- **Pronouns:** use "they" for anyone whose pronouns you don't know.

Take care of the dog. It's going to be a good one.

Firefly
