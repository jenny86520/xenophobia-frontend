import { TextLink } from "@/components/brand/text-link";

type LocationValueProps = {
  location: string;
  /** From the backend: an http(s) link (e.g. a map), or "" / missing for none. */
  locationUrl?: string;
  className?: string;
};

/**
 * A party or sub-party location: an external link (new tab, announced) when the admins gave one,
 * plain text otherwise. The backend only stores http(s) links; anything else still renders as text.
 */
export function LocationValue({ location, locationUrl, className }: LocationValueProps) {
  if (locationUrl && /^https?:\/\//i.test(locationUrl)) {
    return (
      <TextLink href={locationUrl} className={className}>
        {location}
      </TextLink>
    );
  }
  return className ? <span className={className}>{location}</span> : <>{location}</>;
}
