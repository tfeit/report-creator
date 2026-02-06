import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useReport } from "../hooks/useReport";

interface ReportTitleProps {
  title: string;
  children?: ReactNode;
  setEnableEdit?: (enable: boolean) => void;
  enableEdit?: boolean;
  showIcon?: boolean;
  iconLink?: string;
}

export default function ReportTitle({
  title,
  children,
  setEnableEdit,
  enableEdit = false,
  showIcon = false,
  iconLink = ""
}: ReportTitleProps) {

  const { refetch, callbacks } = useReport();

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleUpdate = async (nextTitle: string) => {
    const success = await callbacks.onUpdateTitle(nextTitle);
    if (success) {
      refetch();
    }
    return Boolean(success);
  };

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(title);
    }
  }, [title, isEditing]);

  const cancelEditing = () => {
    setDraftTitle(title);
    setIsEditing(false);
    setEnableEdit?.(false);
  };

  const submitTitle = async () => {
    const nextTitle = draftTitle.trim();
    if (nextTitle === title) {
      setIsEditing(false);
      setEnableEdit?.(false);
      return;
    }

    setIsSubmitting(true);
    const success = await Promise.resolve(handleTitleUpdate(nextTitle));
    setIsSubmitting(false);

    if (success) {
      setIsEditing(false);
      setEnableEdit?.(false);
    }
  };

  return (
    <div id="section-header" className={`report-title-wrapper`}>
      <div className="title">
        {showIcon && (
          <Link href={iconLink} className="lg:hidden flex items-center gap-2 hover:cursor-pointer">
            <ChevronLeftIcon className="w-6 h-6 text-gray-500 dark:text-white shrink-0" />
          </Link>
        )}

        {enableEdit ? (
          <input
            value={draftTitle}
            onChange={event => setDraftTitle(event.target.value)}
            onBlur={() => {
              if (!isSubmitting) {
                submitTitle();
              }
              setEnableEdit?.(false);
            }}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitTitle();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancelEditing();
              }
            }}
            autoFocus
          />
        ) : (
          <h2 className="text-lg xl:text-2xl font-extrabold truncate whitespace-nowrap mr-2">
            {title}
          </h2>
        )}
      </div>
      {children}
    </div>
  );
}
