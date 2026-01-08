/**
 * Stable Diffusion Image Generator for Gozlem
 *
 * Uses Replicate API to generate images for each category
 * Run with: npx tsx scripts/generate-images.ts
 *
 * Requires: REPLICATE_API_TOKEN environment variable
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES_PER_CATEGORY = 25;
const OUTPUT_DIR = './web/public/images/prompts';

// Base style for all images
const BASE_STYLE = "minimalist dark surreal digital art, single subject floating in void, atmospheric noir aesthetic, clean composition, 8k quality, subtle lighting, psychological concept art";

// Category-specific style prompts
const CATEGORY_STYLES: Record<string, string[]> = {
  time: [
    "ethereal hourglass with sand dissolving into light particles, golden accents on black",
    "abstract clock face melting in darkness, surreal time distortion",
    "infinite corridor of clocks fading into distance, monochrome",
    "sundial casting impossible shadows, ancient and modern fusion",
    "pendulum swinging in eternal darkness, motion blur trails",
    "broken pocket watch floating in space, gears exposed",
    "sand dunes forming hourglass shape, time erosion concept",
    "calendar pages flying into void, dates fading",
    "metronome in slow motion, rhythm of time visualization",
    "sunrise and sunset merged in single frame, time duality",
    "tree rings floating as spiral in darkness",
    "candle melting in fast forward, wax forming time shapes",
    "stopwatch frozen at midnight, dramatic lighting",
    "ancient sundial meets digital clock, temporal fusion",
    "seasons changing in single tree, time lapse concept",
    "footprints fading in sand, passage of time",
    "aging hands holding young hands, generational time",
    "crumbling stone revealing fresh surface, time layers",
    "dawn breaking through eternal night, hope and time",
    "calendar spiral descending into infinity",
    "moment frozen in glass sphere, time capsule",
    "clock hands casting shadow of different time",
    "river of time flowing through abstract landscape",
    "butterfly emerging from cocoon, transformation moment",
    "eclipse moment frozen in time, celestial pause"
  ],
  curiosity: [
    "mysterious half-open door with bright light streaming through crack",
    "giant keyhole showing glimpse of unknown world beyond",
    "cat silhouette looking into glowing box, pandora reference",
    "spiral staircase descending into luminous unknown",
    "child's eye reflecting entire universe, wonder concept",
    "question mark formed by stars in dark cosmos",
    "magnifying glass revealing hidden world within droplet",
    "book opening with light and particles emerging",
    "telescope pointed at mysterious celestial phenomenon",
    "maze entrance with multiple glowing paths",
    "curtain partially pulled revealing bright stage",
    "locked treasure chest with light escaping through cracks",
    "mirror showing different reality in reflection",
    "footprints leading into fog, path of discovery",
    "butterfly wing under microscope, hidden patterns",
    "door slightly ajar with mysterious shadows beyond",
    "compass spinning with multiple north directions",
    "window to alternate dimension, portal concept",
    "flashlight beam in complete darkness, exploration",
    "ancient map with uncharted territories glowing",
    "peeling wallpaper revealing cosmic scene beneath",
    "rabbit hole entrance with wonderland glimpse",
    "forbidden fruit glowing in garden of shadows",
    "telescope eye merging with distant galaxy",
    "crystal ball showing swirling possibilities"
  ],
  control: [
    "puppet strings descending from darkness, no puppet visible",
    "single hand gripping steering wheel in void",
    "chess king piece casting shadow of pawn",
    "remote control floating with glowing buttons",
    "throne in empty dark room, power isolation",
    "conductor's baton directing invisible orchestra",
    "reins held by unseen hands, control metaphor",
    "dashboard with many switches and dials, choices",
    "captain's wheel on ship in stormy void",
    "lever between two states, binary choice",
    "traffic light in wilderness, absurd control",
    "master key floating among many locks",
    "crown too heavy, burden of control",
    "chains breaking, release of control",
    "puppet cutting own strings, self liberation",
    "scales of justice held by shadow figure",
    "hand releasing sand through fingers, letting go",
    "iron grip slowly opening, gradual release",
    "tangled strings becoming organized, order from chaos",
    "domino refusing to fall, breaking the chain",
    "marionette standing without strings, autonomy",
    "hand on chess board mid-move, strategic control",
    "compass needle pointing inward, self direction",
    "broken leash floating free, liberation symbol",
    "empty throne room, absence of authority"
  ],
  risk: [
    "silhouette at cliff edge, fog below, precipice moment",
    "tightrope walker over chasm of stars",
    "single card floating before unseen gambler",
    "dice suspended mid-roll, frozen probability",
    "match near powder keg, tension moment",
    "skydiver in freefall before parachute opens",
    "thin ice with visible cracks, dangerous path",
    "moth approaching flame, fatal attraction",
    "bridge of glass over abyss, fragile passage",
    "first domino about to tip, chain reaction",
    "knife balanced on edge, precarious equilibrium",
    "lightning about to strike, danger imminent",
    "leap of faith between buildings, urban risk",
    "poker chips pushed all-in, total commitment",
    "storm clouds approaching calm sea, impending risk",
    "hand reaching into dark unknown space",
    "spinning roulette wheel, fate in motion",
    "narrow path between two chasms, difficult choice",
    "seed germinating in harsh terrain, survival risk",
    "icarus wings near sun, ambition danger",
    "ticking bomb frozen in time, suspended threat",
    "arrows targeting single point, vulnerability",
    "bridge burning behind traveler, no return",
    "ship heading into storm, courageous risk",
    "butterfly effect visualization, small action big consequence"
  ],
  sacrifice: [
    "hands releasing glowing object into void, letting go",
    "scales with heart versus gold, value comparison",
    "phoenix mid-transformation, death and rebirth",
    "empty hands after giving, generous poverty",
    "tree shedding leaves willingly, seasonal sacrifice",
    "candle illuminating darkness, self-consumption",
    "mother bird feeding chicks, parental sacrifice",
    "soldier's helmet on rifle, ultimate price",
    "artist destroying canvas, creative sacrifice",
    "breaking piggy bank, financial sacrifice",
    "cutting rope to save others, hard choice",
    "heart outside chest, vulnerability offering",
    "bridge being burned by builder, commitment",
    "trophy being given away, glory sacrifice",
    "clock being smashed, time sacrifice",
    "comfortable chair abandoned for thorny path",
    "mask being removed, identity sacrifice",
    "crown placed on ground, power relinquished",
    "feast given to hungry, sharing abundance",
    "wings clipped by choice, grounded decision",
    "anchor released, freedom from security",
    "old self dissolving into new, transformation",
    "seed buried in earth, potential sacrifice",
    "love letter burned, closure sacrifice",
    "shelter given away in storm, ultimate generosity"
  ],
  pattern: [
    "infinite tessellation fading into darkness, geometric pattern",
    "footprints making spiral in sand, unconscious pattern",
    "broken record groove, repetition visualization",
    "mandala forming and dissolving, cyclical pattern",
    "maze from bird's eye view, life patterns",
    "seasons wheel turning, natural cycles",
    "domino chain in circular arrangement",
    "fibonacci spiral in abstract form",
    "echo visualized as repeating waves",
    "mirror reflecting infinite mirrors, recursion",
    "tree branches forming fractal patterns",
    "ripples overlapping in still water",
    "habit loop visualization, trigger action reward",
    "same road traveled many times, worn path",
    "clock faces showing same time, repetition",
    "DNA helix glowing in darkness, life pattern",
    "moth circling lamp eternally, attraction pattern",
    "tide marks on beach, rhythmic pattern",
    "circular staircase going nowhere, endless loop",
    "neural network visualization, thought patterns",
    "calendar with same day repeating",
    "broken chain trying to reform, habit breaking",
    "shuffle becoming order, pattern emergence",
    "quantum probability clouds, pattern uncertainty",
    "constellation connecting random stars, pattern seeking"
  ],
  memory: [
    "fading polaroid floating in darkness, memory decay",
    "brain as library with scattered books, memory storage",
    "foggy mirror showing past reflection",
    "old photograph burning at edges, memory loss",
    "childhood toy in adult hand, nostalgia",
    "footprints being washed away by tide, forgetting",
    "journal pages flying in wind, scattered memories",
    "empty picture frame, forgotten face",
    "road behind disappearing in fog, past fading",
    "broken music box, forgotten melody",
    "tree with initials fading, time eroding memory",
    "sandcastle being reclaimed by sea, impermanence",
    "film reel unspooling into void, memory stream",
    "ghost of former self, identity memory",
    "attic full of covered furniture, stored memories",
    "old letters bundled with fading ribbon",
    "clock face with blurred numbers, time confusion",
    "path through woods becoming overgrown",
    "lighthouse beam in thick fog, searching memory",
    "puzzle with missing pieces, incomplete memory",
    "echo fading in canyon, sound memory",
    "perfume bottle evoking memories, scent trigger",
    "ancient ruins, civilizations forgotten",
    "childhood drawing on fridge, innocent memory",
    "grave with fresh flowers, honoring memory"
  ]
};

// Negative prompt for all images
const NEGATIVE_PROMPT = "text, watermark, logo, signature, blurry, low quality, distorted, cartoon, anime, 3d render, photorealistic face, multiple subjects, cluttered, busy background, bright colors, happy, cheerful";

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

async function generateImage(
  replicate: Replicate,
  prompt: string,
  category: string,
  index: number
): Promise<string | null> {
  const fullPrompt = `${prompt}, ${BASE_STYLE}`;

  console.log(`\n📸 Generating ${category}_${String(index).padStart(3, '0')}...`);
  console.log(`   Prompt: ${prompt.substring(0, 60)}...`);

  try {
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: fullPrompt,
          negative_prompt: NEGATIVE_PROMPT,
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          refine: "expert_ensemble_refiner",
          high_noise_frac: 0.8,
        }
      }
    ) as string[];

    if (output && output[0]) {
      return output[0];
    }
    return null;
  } catch (error) {
    console.error(`   ❌ Error: ${error}`);
    return null;
  }
}

async function main() {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    console.error('❌ REPLICATE_API_TOKEN environment variable is required');
    console.log('\nTo get an API token:');
    console.log('1. Go to https://replicate.com');
    console.log('2. Sign up or log in');
    console.log('3. Go to https://replicate.com/account/api-tokens');
    console.log('4. Create a new token');
    console.log('5. Run: REPLICATE_API_TOKEN=your_token npx tsx scripts/generate-images.ts');
    process.exit(1);
  }

  const replicate = new Replicate({ auth: apiToken });

  console.log('🎨 Gozlem Image Generator');
  console.log('========================\n');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🖼️  Images per category: ${IMAGES_PER_CATEGORY}`);
  console.log(`📊 Total images: ${Object.keys(CATEGORY_STYLES).length * IMAGES_PER_CATEGORY}`);

  // Ensure output directories exist
  for (const category of Object.keys(CATEGORY_STYLES)) {
    const dir = path.join(OUTPUT_DIR, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  let totalGenerated = 0;
  let totalFailed = 0;

  for (const [category, prompts] of Object.entries(CATEGORY_STYLES)) {
    console.log(`\n\n🎯 Category: ${category.toUpperCase()}`);
    console.log('─'.repeat(40));

    for (let i = 0; i < IMAGES_PER_CATEGORY; i++) {
      const prompt = prompts[i % prompts.length];
      const filename = `${category}_${String(i + 1).padStart(3, '0')}.webp`;
      const filepath = path.join(OUTPUT_DIR, category, filename);

      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`   ⏭️  ${filename} already exists, skipping`);
        totalGenerated++;
        continue;
      }

      const imageUrl = await generateImage(replicate, prompt, category, i + 1);

      if (imageUrl) {
        try {
          // Download as webp
          const tempPath = filepath.replace('.webp', '.png');
          await downloadImage(imageUrl, tempPath);

          // For now, just rename (proper webp conversion would need sharp or similar)
          fs.renameSync(tempPath, filepath.replace('.webp', '.png'));

          console.log(`   ✅ Saved: ${filename.replace('.webp', '.png')}`);
          totalGenerated++;
        } catch (err) {
          console.error(`   ❌ Failed to save: ${err}`);
          totalFailed++;
        }
      } else {
        totalFailed++;
      }

      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n\n📊 Summary');
  console.log('═'.repeat(40));
  console.log(`✅ Generated: ${totalGenerated}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📁 Location: ${OUTPUT_DIR}`);
}

main().catch(console.error);
