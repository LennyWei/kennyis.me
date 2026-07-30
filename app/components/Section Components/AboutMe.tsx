import { ContentGrid, GridBlock } from "../ContentGrid";

export function AboutSection() {
  return (
    <ContentGrid
      rows={6}
      cols={4}
      rowSizes={["1fr", "1fr", "1fr", "1fr", "1fr", "auto"]}
      colSizes={["2fr", "2fr", "1fr", "1fr"]}
      height="600px"
      width="70vw"
      gap="1.5rem"
      className="mx-auto"
      showGuides = {true}
    >
      {/* Portrait — top-left, 2 cols x 5 rows */}
      <GridBlock
        rowStart={1}
        rowSpan={5}
        colStart={1}
        colSpan={2}
        className="overflow-hidden rounded-lg"
      >
        <img
          src="/me.jpg"
          alt="Portrait"
          className="h-full w-full object-cover"
        />
      </GridBlock>

      {/* Name / tagline — top-right, 2 cols x 1 row */}
      <GridBlock
        rowStart={1}
        rowSpan={1}
        colStart={3}
        colSpan={2}
        className="flex flex-col justify-center"
      >
        <h2 className="text-3xl font-semibold text-[#f5eedc]">Your Name</h2>
        <p className="text-sm text-[#f5eedc]/60">Developer & Designer</p>
      </GridBlock>

      {/* Bio — fills the rest of the right column */}
      <GridBlock
        rowStart={2}
        rowSpan={4}
        colStart={3}
        colSpan={2}
        className="flex items-start"
      >
        <p className="text-base leading-relaxed text-[#f5eedc]/80">
          A couple paragraphs about who you are, what you build, and what
          you're into. This block just grows to fill whatever space is
          left between the tagline and the links below.
        </p>
      </GridBlock>

      {/* Links — bottom row, full width */}
      <GridBlock
        rowStart={6}
        rowSpan={1}
        colStart={1}
        colSpan={4}
        className="flex items-center gap-6"
      >
        {/* swap these for your icon component */}
        <a href="#" className="text-[#f5eedc]/70 hover:text-[#f5eedc]">GitHub</a>
        <a href="#" className="text-[#f5eedc]/70 hover:text-[#f5eedc]">LinkedIn</a>
        <a href="#" className="text-[#f5eedc]/70 hover:text-[#f5eedc]">Email</a>
      </GridBlock>
    </ContentGrid>
  );
}