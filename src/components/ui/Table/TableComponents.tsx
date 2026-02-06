import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, PhotoIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import Tag from "../Tag";

const TableContext = createContext({
  bleed: false,
  dense: false,
  grid: false,
  striped: false
});

interface TableProps {
  bleed?: boolean;
  dense?: boolean;
  grid?: boolean;
  striped?: boolean;
  className?: string;
  children: ReactNode;
}

export const Table: React.FC<TableProps> = ({
  bleed = false,
  dense = false,
  grid = false,
  striped = false,
  className,
  children,
  ...props
}) => {
  return (
    <TableContext.Provider value={{ bleed, dense, grid, striped }}>
      <div className="flow-root">
        <div {...props} className={clsx(className, "-mx-(--gutter) whitespace-nowrap")}>
          <div className={clsx("inline-block min-w-full align-middle", !bleed && "sm:px-(--gutter)")}>
            <table className="min-w-full text-left text-sm/6 text-zinc-950 dark:text-white">{children}</table>
          </div>
        </div>
      </div>
    </TableContext.Provider>
  );
};

interface TableHeadProps {
  className?: string;
  children: ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ className, ...props }) => {
  return <thead {...props} className={clsx(className, "text-zinc-500 dark:text-zinc-400")} />;
};

interface TableBodyProps {
  children: ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = props => {
  return <tbody {...props} />;
};

interface TableRowContextType {
  href?: string;
  target?: string;
  title?: string;
}

export const TableRowContext = createContext<TableRowContextType>({
  href: undefined,
  target: undefined,
  title: undefined
});

interface TableRowProps {
  href?: string;
  target?: string;
  title?: string;
  className?: string;
  children: ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ href, target, title, className, ...props }) => {
  const { striped } = useContext(TableContext);

  return (
    <TableRowContext.Provider value={{ href, target, title }}>
      <tr
        {...props}
        className={clsx(
          className,
          href &&
            "has-[[data-row-link][data-focus]]:outline-2 has-[[data-row-link][data-focus]]:-outline-offset-2 has-[[data-row-link][data-focus]]:outline-blue-500 dark:focus-within:bg-white/2.5",
          striped && "even:bg-zinc-950/2.5 dark:even:bg-white/2.5",
          href && striped && "hover:bg-zinc-950/5 dark:hover:bg-white/5",
          href && !striped && "hover:bg-zinc-950/2.5 dark:hover:bg-white/2.5"
        )}
      />
    </TableRowContext.Provider>
  );
};

interface TableHeaderProps {
  className?: string;
  colSpan?: number;
  children: ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ className, ...props }) => {
  const { bleed, grid } = useContext(TableContext);

  return (
    <th
      {...props}
      className={clsx(
        className,
        "border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) dark:border-b-white/10 first:rounded-l-md last:rounded-r-md",
        grid && "border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5",
      )}
    />
  );
};

interface TableCellProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  colSpan?: number;
  rowSpan?: number;
}

export const TableCell: React.FC<TableCellProps> = ({ className, children, rowSpan, onClick, ...props }) => {
  const { bleed, dense, grid, striped } = useContext(TableContext);
  const { href, target, title } = useContext(TableRowContext);
  const [cellRef, setCellRef] = useState<HTMLTableCellElement | null>(null);

  return (
    <td
      ref={href ? setCellRef : undefined}
      onClick={!href ? onClick : undefined}
      rowSpan={rowSpan}
      {...props}
      className={clsx(
        className,
        "relative px-4 py-2.5 last:pr-(--gutter,--spacing(2)) min-w-60 overflow-hidden text-ellipsis whitespace-nowrap",
        !striped && "border-b border-zinc-950/5 dark:border-white/5",
        grid && "border-l border-l-zinc-950/5 dark:border-l-white/5",
        dense ? "" : "py-4",
        !bleed && "sm:last:pr-1",
        onClick && !href && "cursor-pointer"
      )}
    >
      {href ? (
        <Link
          data-row-link
          href={href}
          target={target}
          aria-label={title}
          tabIndex={cellRef?.previousElementSibling === null ? 0 : -1}
          className="absolute inset-0 focus:outline-hidden"
        />
      ) : null}
      {children}
    </td>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
}

export const TablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  canPreviousPage,
  canNextPage
}) => {
  return (
    <div className="flex items-center gap-2 w-full justify-end pb-4">
      <button onClick={onPreviousPage} disabled={!canPreviousPage} className="p-1 bg-transparent border-none cursor-pointer">
        <ChevronLeftIcon className="w-6 h-6 text-(--color-blue) hover:text-(--color-darkblue)" />
      </button>
      <span className="w-48 text-center">
        Seite <strong>{currentPage} von {totalPages}</strong>
      </span>
      <button onClick={onNextPage} disabled={!canNextPage} className="p-1 bg-transparent border-none">
        <ChevronRightIcon className="w-6 h-6 text-(--color-blue) hover:text-(--color-darkblue)" />
      </button>
    </div>
  );
};

export const TableCellWithCover: React.FC<{
  cover?: string;
  title: string;
  slug?: string;
  type?: string;
}> = ({ cover, title, slug, type }) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>(cover || "");

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    setImageError(false);
    setImageSrc(cover || "");
  }, [cover]);

  return (
    <div className="flex gap-4 items-center min-w-0 max-w-full">
      <div className="bg-(--color-blue)/20 h-12 w-20 shrink-0 rounded-md overflow-hidden flex items-center justify-center">
        {cover && !imageError ? (
          <Image
            className="h-full w-full object-cover"
            src={imageSrc}
            alt={`Cover ${title}`}
            width={160}
            height={96}
            onError={handleImageError}
            unoptimized={imageSrc?.startsWith("http://") || imageSrc?.startsWith("https://")}
          />
        ) : (
          <PhotoIcon className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex flex-col gap-1 min-w-0 lg:min-w-40 flex-1 overflow-hidden">
        <span className="font-medium text-sm truncate">{title}</span>
        {type && <Tag color="blue" content={type as string} />}
        {slug && <span className="text-xs text-gray-500 truncate">{slug}</span>}
      </div>
    </div>
  );
};
