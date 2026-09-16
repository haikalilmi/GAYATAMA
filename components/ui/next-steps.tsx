import { Bell, ClipboardCheck, Sparkles } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "A reviewer checks your photos",
    desc: "A real person on our team looks at the proof you sent. This usually takes less than 48 hours.",
  },
  {
    icon: Bell,
    title: "You get a notification",
    desc: "Open the bell icon in the sidebar to see the result. If a photo is unclear, we ask you to fix it once.",
  },
  {
    icon: Sparkles,
    title: "Your XP and points are added",
    desc: "Once approved, the reward appears on your dashboard by itself. Nothing else to do.",
  },
];

export function NextSteps({ className }: { className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-sky-200/80 bg-sky-50/50 p-5 sm:p-6 space-y-4 ${className ?? ""}`}
    >
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-sky-900">
          What happens next?
        </h2>
        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
          Your proof has been sent. Here is what we do from here.
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sky-700 border border-sky-200/80 font-mono text-xs font-bold">
                {i + 1}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                  <span>{step.title}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
