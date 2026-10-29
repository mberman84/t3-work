import { scopeProjectRef } from "@t3tools/client-runtime/environment";
import { Link } from "@tanstack/react-router";
import { ArrowUpRightIcon, FolderPlusIcon, SparklesIcon } from "lucide-react";
import { useRef, useState } from "react";
import * as Schema from "effect/Schema";
import { openCommandPalette } from "../../commandPaletteBus";
import { isElectron } from "../../env";
import { useNewThreadHandler } from "../../hooks/useHandleNewThread";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useScratchProject } from "../../hooks/useScratchProject";
import { workspaceAreaProps } from "../../lib/workspaceFocus";
import { useProjects, useThreadShells } from "../../state/entities";
import { usePrimaryEnvironmentId } from "../../state/environments";
import { WorkspacePageHeader } from "../WorkspacePageHeader";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "../ui/select";
import { SidebarInset } from "../ui/sidebar";
import { Textarea } from "../ui/textarea";
import { ChromeWorkspace } from "./ChromeWorkspace";

const STARTERS = [
  {
    title: "Research & compare",
    prompt:
      "Help me research a decision. Compare the options, cite sources, and explain the tradeoffs. The question is: ",
  },
  {
    title: "Write & refine",
    prompt:
      "Help me turn my notes into a clear, useful document. Start by understanding the audience and outcome. Here are my notes: ",
  },
  {
    title: "Make a one-off",
    prompt:
      "Help me finish a one-off project. Aim for a useful deliverable with minimal setup. Here's what I need: ",
  },
  {
    title: "Think & plan",
    prompt:
      "Help me think through a problem and turn it into a practical plan. Here's the situation: ",
  },
] as const;

export function WorkHome() {
  const projects = useProjects();
  const threads = useThreadShells();
  const primaryEnvironmentId = usePrimaryEnvironmentId();
  const { scratchEnvironmentId, openScratchProject } = useScratchProject();
  const handleNewThread = useNewThreadHandler();
  const [prompt, setPrompt] = useLocalStorage("t3-work.home-prompt", "", Schema.String);
  const [destination, setDestination] = useState("quick");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const scratchTarget = scratchEnvironmentId(primaryEnvironmentId);
  const savedProjects = projects.filter((project) => !project.isScratch);
  const selectedProject = savedProjects.find(
    (project) => `${project.environmentId}:${project.id}` === destination,
  );
  const recentThreads = [...threads]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  const start = async () => {
    if (!prompt.trim() || inFlight.current) return;
    inFlight.current = true;
    setStarting(true);
    setError(null);
    const project =
      destination === "quick"
        ? scratchTarget === null
          ? null
          : await openScratchProject(scratchTarget)
        : (selectedProject ?? null);
    if (project === null) {
      setError("Connect a machine or choose an available project to start.");
      inFlight.current = false;
      setStarting(false);
      return;
    }
    await handleNewThread(scopeProjectRef(project.environmentId, project.id), {
      prompt,
      envMode: "local",
    })
      .then((opened) => {
        if (opened === null) setError("The workspace changed. Try again.");
        else setPrompt((current) => (current === prompt ? "" : current));
      })
      .catch(() => setError("Could not open this task. Your text is still here."));
    inFlight.current = false;
    setStarting(false);
  };

  return (
    <SidebarInset
      {...workspaceAreaProps("home", 1, "Work home")}
      role="main"
      className="scrollbar-gutter-both h-dvh min-h-0 overflow-auto"
    >
      {isElectron ? <WorkspacePageHeader electron /> : null}
      <div className="mx-auto w-full max-w-5xl space-y-9 px-5 py-10 sm:px-10 sm:py-16">
        <header className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            T3 Work · Your everyday workspace
          </p>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            What would you like to get done?
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            A quick question, a finished document, a little project, or a bigger idea. Start here
            and keep your work together.
          </p>
        </header>
        <section
          aria-label="Start a task"
          className="space-y-4 rounded-2xl border bg-card p-5 sm:p-6"
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void start();
            }}
          >
            <Textarea
              aria-label="What would you like to work on?"
              placeholder="Describe the outcome you want. Add notes, a question, or a link…"
              size="lg"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 max-w-full sm:w-64">
                <Select
                  value={destination}
                  onValueChange={(value) => {
                    if (value !== null) setDestination(value);
                  }}
                >
                  <SelectTrigger aria-label="Where to save this task">
                    <SelectValue>
                      {destination === "quick"
                        ? "Quick task · no project needed"
                        : (selectedProject?.title ?? "Choose a project")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="quick">Quick task · no project needed</SelectItem>
                    {savedProjects.map((project) => (
                      <SelectItem
                        key={`${project.environmentId}:${project.id}`}
                        value={`${project.environmentId}:${project.id}`}
                      >
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={
                  starting || !prompt.trim() || (destination === "quick" && scratchTarget === null)
                }
              >
                <SparklesIcon />
                {starting ? "Opening…" : "Start working"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Opens a draft for you to review before sending. Quick tasks keep their conversation
              and files.
            </p>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </form>
          <div className="flex flex-wrap gap-2" aria-label="Task starters">
            {STARTERS.map((starter) => (
              <Button
                key={starter.title}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(starter.prompt)}
              >
                {starter.title}
              </Button>
            ))}
          </div>
        </section>
        <ChromeWorkspace
          onUsePage={(context) =>
            setPrompt(
              (current) =>
                `${current}${current ? "\n\n" : "Help me work with this page.\n\n"}${context}`,
            )
          }
        />
        <section className="space-y-4" aria-label="Recent work">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-medium">Pick up where you left off</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openCommandPalette({ open: "add-project" })}
            >
              <FolderPlusIcon />
              Add project
            </Button>
          </div>
          {recentThreads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your conversations will appear here as you work.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentThreads.map((thread) => (
                <Link
                  key={`${thread.environmentId}:${thread.id}`}
                  to="/$environmentId/$threadId"
                  params={{ environmentId: thread.environmentId, threadId: thread.id }}
                  className="flex items-center justify-between gap-3 rounded-xl border p-4 text-sm hover:bg-muted/50"
                >
                  <span className="truncate">{thread.title || "Untitled task"}</span>
                  <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </SidebarInset>
  );
}
