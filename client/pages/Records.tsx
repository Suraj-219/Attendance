import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-regular-svg-icons";
export default function Records() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <a className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-background shadow-sm transition hover:bg-primary hover:text-primary-foreground hover:shadow-lg" href="/">
          <FontAwesomeIcon icon={faCircleLeft} />
          <span>Back</span>
        </a>
      <h1 className="text-2xl font-semibold mb-2">Records</h1>
      <p className="text-muted-foreground">This page will show a table with filters (course/date), per-student status, and CSV export. Ask me to build it next.</p>
    </div>
  );
}
