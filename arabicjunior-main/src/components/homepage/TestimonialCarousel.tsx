"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "../ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/Testimonial";

/**
 * The interactive half of the testimonials section. Its parent is a server
 * component that fetches the records, so the cards are present in the HTML
 * Google receives — the reviews are worth indexing, and they were server
 * rendered before this section moved to the database.
 *
 * The parent renders one of these per format. Each card still picks its own
 * layout from `type`, so a list that happens to be mixed keeps working.
 *
 * @param name distinguishes the two carousels on a page for screen readers.
 */
const TestimonialCarousel = ({
  testimonials,
  name = "testimonial",
}: {
  testimonials: Testimonial[];
  name?: string;
}) => {
  const [playing, setPlaying] = useState<Testimonial | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  // Driven from embla rather than a click handler, so the dots stay correct
  // when autoplay or a swipe moves the carousel.
  useEffect(() => {
    if (!api) return;
    setSlideCount(api.scrollSnapList().length);
    setSelected(api.selectedScrollSnap());

    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const openVideo = useCallback((testimonial: Testimonial) => {
    setPlaying(testimonial);
  }, []);

  // Splitting the reviews by format leaves each carousel with fewer cards, and
  // embla packs whatever it has against the left edge. A single review at a
  // third of the width reads as a layout bug, so short lists take a wider card
  // and get centred.
  const basis =
    testimonials.length === 1
      ? "basis-full sm:basis-2/3 lg:basis-1/2"
      : testimonials.length === 2
      ? "basis-full sm:basis-1/2"
      : "basis-full sm:basis-1/2 lg:basis-1/3";

  return (
    <React.Fragment>
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: testimonials.length > 3 }}
        plugins={[
          Autoplay({
            delay: 4500,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent
          className={cn(
            "-ml-4 py-2 items-stretch",
            testimonials.length < 3 && "justify-center"
          )}
        >
          {testimonials.map((testimonial) => (
            <CarouselItem
              key={testimonial._id}
              className={cn("pl-4", basis)}
            >
              {testimonial.type === "video" ? (
                <VideoCard
                  testimonial={testimonial}
                  onPlay={() => openVideo(testimonial)}
                />
              ) : (
                <TextCard testimonial={testimonial} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Once the reviews are split by format a carousel can hold a single
            card, and arrows either side of something that cannot move look
            broken. slideCount comes from embla, so this follows the real
            breakpoint rather than a guess at how many fit. */}
        {slideCount > 1 && (
          <React.Fragment>
            <CarouselPrevious className="hidden sm:flex -left-4" />
            <CarouselNext className="hidden sm:flex -right-4" />
          </React.Fragment>
        )}
      </Carousel>

      {slideCount > 1 && (
        <div
          aria-label={`${name}-carousel-dots`}
          className="flex items-center justify-center gap-2 pt-8"
        >
          {Array.from({ length: slideCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to ${name} ${index + 1}`}
              aria-current={index === selected}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selected
                  ? "w-6 bg-orange-500"
                  : "w-2 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
      )}

      <VideoDialog testimonial={playing} onClose={() => setPlaying(null)} />
    </React.Fragment>
  );
};

export default TestimonialCarousel;

const Stars = ({ rating }: { rating: number }) => (
  <div
    aria-label={`Rated ${rating} out of 5`}
    className="flex items-center gap-x-2"
  >
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        aria-hidden="true"
        className={
          index < rating
            ? "w-5 h-5 text-yellow-500 fill-yellow-500"
            : "w-5 h-5 text-neutral-200 fill-neutral-200"
        }
      />
    ))}
  </div>
);

const AuthorBlock = ({ testimonial }: { testimonial: Testimonial }) => (
  <div className="flex items-center gap-x-4">
    {testimonial.image ? (
      <div
        aria-label="author-image-wrapper"
        className="w-16 h-16 shrink-0 rounded-full overflow-hidden bg-[#CDE2F7]"
      >
        <Image
          src={testimonial.image}
          alt={`${testimonial.authorName} — Arabic Juniors`}
          width={128}
          height={128}
          className="w-full h-full object-cover object-top"
        />
      </div>
    ) : (
      <div
        aria-hidden="true"
        className="w-16 h-16 shrink-0 rounded-full bg-[#CDE2F7] flex items-center justify-center text-xl font-semibold text-neutral-700"
      >
        {testimonial.authorName.charAt(0).toUpperCase()}
      </div>
    )}

    <div className="min-w-0">
      <h6
        aria-label="author-name"
        className="text-lg font-medium text-neutral-900 truncate"
      >
        {testimonial.authorName}
      </h6>
      <p aria-label="profession" className="text-sm font-normal text-neutral-400">
        {testimonial.profession}
      </p>
    </div>
  </div>
);

const TextCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <div
    aria-label="reviews-card"
    className="h-full flex flex-col p-5 rounded-2xl border border-neutral-100 transition-all ease-in-out duration-300 hover:bg-[#F5F5F5]"
  >
    <div className="mb-5">
      <AuthorBlock testimonial={testimonial} />
    </div>

    <div aria-label="student-reviews-star-wrapper" className="mb-6">
      <Stars rating={testimonial.rating} />
    </div>

    <p
      aria-label="review-text"
      className="text-base sm:text-lg font-normal text-neutral-900 line-clamp-4"
    >
      {testimonial.comment}
    </p>
  </div>
);

const VideoCard = ({
  testimonial,
  onPlay,
}: {
  testimonial: Testimonial;
  onPlay: () => void;
}) => {
  const poster = testimonial.videoThumbnail || testimonial.image;

  return (
    <div
      aria-label="reviews-card-video"
      className="h-full flex flex-col p-5 rounded-2xl border border-neutral-100 transition-all ease-in-out duration-300 hover:bg-[#F5F5F5]"
    >
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play video testimonial from ${testimonial.authorName}`}
        className="group relative w-full aspect-video mb-5 rounded-xl overflow-hidden bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      >
        {poster ? (
          <Image
            src={poster}
            alt={`${testimonial.authorName} video testimonial`}
            width={640}
            height={360}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 bg-gradient-to-br from-[#FB6238] to-[#F5AE14]" />
        )}

        <span className="absolute inset-0 bg-scrim/25 transition-colors duration-300 group-hover:bg-scrim/35" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="w-6 h-6 text-orange-500 fill-orange-500 translate-x-0.5" />
          </span>
        </span>
      </button>

      <div className="mb-4">
        <AuthorBlock testimonial={testimonial} />
      </div>

      <div className="mb-4">
        <Stars rating={testimonial.rating} />
      </div>

      {testimonial.comment && (
        <p
          aria-label="review-text"
          className="text-base font-normal text-neutral-900 line-clamp-4"
        >
          {testimonial.comment}
        </p>
      )}
    </div>
  );
};

const VideoDialog = ({
  testimonial,
  onClose,
}: {
  testimonial: Testimonial | null;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(testimonial)} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-3xl p-0 overflow-hidden bg-scrim border-none">
      {/* Required for the dialog to be announced; the video itself is the
          visible content, so the title is kept off-screen. */}
      <DialogTitle className="sr-only">
        {testimonial
          ? `Video testimonial from ${testimonial.authorName}`
          : "Video testimonial"}
      </DialogTitle>

      {testimonial && (
        <div className="aspect-video w-full">
          {testimonial.videoSource === "upload" ? (
            <video
              key={testimonial._id}
              src={testimonial.videoUrl}
              poster={testimonial.videoThumbnail}
              controls
              autoPlay
              playsInline
              className="w-full h-full"
            >
              Your browser does not support embedded video.
            </video>
          ) : (
            <iframe
              key={testimonial._id}
              src={`${testimonial.videoEmbedUrl}${
                testimonial.videoEmbedUrl?.includes("?") ? "&" : "?"
              }autoplay=1`}
              title={`Video testimonial from ${testimonial.authorName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          )}
        </div>
      )}
    </DialogContent>
  </Dialog>
);
