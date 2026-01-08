/**
 * DALL-E Image Generator for Gozlem
 * Uses OpenAI API to generate images for each category
 * Run with: npx tsx scripts/generate-dalle.ts
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES_PER_CATEGORY = 25;
const OUTPUT_DIR = './web/public/images/prompts';

// Category-specific prompts for DALL-E
const CATEGORY_PROMPTS: Record<string, string[]> = {
  time: [
    "ethereal hourglass with golden sand dissolving into light particles, floating in dark void, minimalist surreal art",
    "melting clock face in darkness, salvador dali inspired, noir aesthetic, single subject",
    "infinite corridor of antique clocks fading into fog, monochrome, atmospheric",
    "ancient sundial casting impossible geometric shadows, dark background, mystical",
    "pendulum swinging in eternal darkness with motion blur trails, minimalist",
    "broken pocket watch floating in space with exposed gears, dramatic lighting",
    "sand dunes forming hourglass silhouette, time erosion concept, dark tones",
    "calendar pages flying into void, dates fading away, surreal dark art",
    "metronome frozen mid-swing, rhythm of time visualization, noir style",
    "sunrise and sunset merged in single frame, time duality concept art",
    "tree rings floating as golden spiral in darkness, time layers",
    "candle melting in fast forward, wax forming clock shapes, dark background",
    "stopwatch frozen at midnight, dramatic noir lighting, single subject",
    "ancient sundial merging with digital clock display, temporal fusion art",
    "four seasons in single tree silhouette, time lapse concept, dark void",
    "footprints slowly fading in black sand, passage of time metaphor",
    "young and old hands touching, generational time concept, dark art",
    "crumbling stone revealing fresh surface beneath, time layers concept",
    "first light breaking through eternal night, hope and time, minimalist",
    "calendar spiral descending into infinite darkness, surreal",
    "moment frozen inside glass sphere, time capsule concept art",
    "clock hands casting shadow showing different time, paradox art",
    "river of golden light flowing through dark abstract landscape, time flow",
    "butterfly emerging from chrysalis, transformation moment, dark background",
    "solar eclipse frozen in time, celestial pause, dramatic noir art"
  ],
  curiosity: [
    "mysterious half-open door with bright light streaming through crack, dark room",
    "giant keyhole showing glimpse of colorful unknown world beyond, noir style",
    "cat silhouette peering into glowing box, pandora reference, dark art",
    "spiral staircase descending into luminous unknown depths, atmospheric",
    "child's eye reflecting entire universe and stars, wonder concept art",
    "question mark constellation formed by stars in dark cosmos",
    "magnifying glass revealing hidden miniature world within water droplet",
    "ancient book opening with light particles and magic emerging, dark background",
    "telescope pointed at mysterious glowing celestial phenomenon, noir",
    "maze entrance with multiple glowing paths diverging, dark atmosphere",
    "velvet curtain partially pulled revealing bright mysterious stage",
    "locked treasure chest with golden light escaping through cracks",
    "mirror showing completely different surreal reality in reflection",
    "single footprint trail leading into mysterious fog, discovery path",
    "butterfly wing under microscope revealing hidden cosmic patterns",
    "door slightly ajar with mysterious shadows and light beyond",
    "compass with needle spinning between multiple north directions",
    "window frame showing portal to alternate dimension, dark room",
    "flashlight beam cutting through complete darkness, exploration",
    "ancient map with uncharted territories glowing mysteriously",
    "peeling wallpaper revealing cosmic starfield scene beneath",
    "rabbit hole entrance with wonderland glimpse below, dark art",
    "glowing forbidden fruit in shadowy garden, temptation concept",
    "eye merged with telescope lens viewing distant galaxy",
    "crystal ball showing swirling infinite possibilities, dark background"
  ],
  control: [
    "puppet strings descending from darkness, no puppet visible, control metaphor",
    "single hand gripping steering wheel in void, determination, noir",
    "chess king piece casting shadow of small pawn, power illusion",
    "remote control floating with glowing buttons in darkness",
    "empty throne in vast dark room, power and isolation concept",
    "conductor's baton directing invisible orchestra, dark background",
    "leather reins held by unseen hands, control metaphor, noir style",
    "complex dashboard with many switches and dials, choices concept",
    "ship's wheel in stormy void, captain's control, dramatic lighting",
    "lever between two states on/off, binary choice concept art",
    "traffic light standing alone in wilderness, absurd control symbol",
    "master key floating among countless locks, access concept",
    "heavy crown weighing down, burden of control and power",
    "chains breaking apart, release of control, liberation art",
    "marionette cutting its own strings with scissors, self liberation",
    "scales of justice held by shadow figure, balance concept",
    "hand releasing sand through fingers, letting go of control",
    "iron grip slowly opening to release, gradual surrender",
    "tangled puppet strings becoming organized, order from chaos",
    "single domino refusing to fall, breaking the chain reaction",
    "marionette standing confidently without strings, autonomy symbol",
    "hand hovering over chess board mid-move, strategic control",
    "compass needle pointing inward to self, self direction concept",
    "broken leash floating free in void, liberation symbol",
    "empty throne room with dust, absence of authority"
  ],
  risk: [
    "silhouette standing at cliff edge, fog below, precipice moment",
    "tightrope walker over chasm filled with stars, balance and risk",
    "single playing card floating before unseen gambler, fate concept",
    "dice suspended mid-roll, frozen probability moment, noir style",
    "lit match hovering near powder keg, tension moment, dark art",
    "skydiver in freefall moment before parachute opens, dark sky",
    "thin ice with visible cracks spreading, dangerous path ahead",
    "moth approaching bright flame, fatal attraction concept art",
    "bridge made of glass over dark abyss, fragile passage",
    "first domino about to tip, chain reaction imminent, noir",
    "knife balanced perfectly on edge, precarious equilibrium",
    "lightning bolt about to strike, danger imminent, dramatic",
    "leap of faith between tall buildings, urban risk, dark city",
    "poker chips pushed all-in, total commitment moment, noir",
    "storm clouds approaching calm dark sea, impending risk",
    "hand reaching into dark unknown space, blind risk",
    "roulette wheel spinning, fate in motion, casino noir",
    "narrow path between two deep chasms, difficult choice",
    "seed germinating in harsh cracked terrain, survival risk",
    "icarus wings approaching sun, ambition and danger",
    "ticking time bomb frozen in time, suspended threat",
    "multiple arrows targeting single point, vulnerability concept",
    "bridge burning behind lone traveler, no return path",
    "ship heading into massive storm, courageous risk art",
    "butterfly effect visualization, small action big consequence"
  ],
  sacrifice: [
    "hands releasing glowing precious object into void, letting go",
    "scales balancing heart against gold coins, value comparison",
    "phoenix mid-transformation, death and rebirth flames, dark art",
    "empty open hands after giving everything, generous poverty",
    "tree willingly shedding golden leaves, seasonal sacrifice",
    "candle illuminating darkness while consuming itself, selfless light",
    "mother bird feeding hungry chicks, parental sacrifice art",
    "soldier's helmet resting on rifle, ultimate price symbol",
    "artist destroying own canvas, creative sacrifice concept",
    "piggy bank being broken open, financial sacrifice moment",
    "rope being cut to save others below, hard choice art",
    "anatomical heart held outside chest, vulnerability offering",
    "bridge being burned by its builder, commitment symbol",
    "trophy being given away to another, glory sacrifice",
    "clock being smashed, time sacrifice concept, noir style",
    "comfortable chair abandoned for thorny difficult path ahead",
    "mask being removed revealing vulnerable face beneath",
    "crown being placed on ground, power relinquished art",
    "feast table given to hungry shadows, sharing abundance",
    "wings being clipped by choice, grounded decision concept",
    "anchor being released, freedom from security, floating away",
    "old self dissolving into new form, transformation sacrifice",
    "seed being buried in dark earth, potential sacrifice art",
    "love letter burning to ash, closure sacrifice moment",
    "shelter being given away in storm, ultimate generosity"
  ],
  pattern: [
    "infinite tessellation pattern fading into darkness, geometric art",
    "footprints making perfect spiral in sand, unconscious pattern",
    "broken vinyl record groove closeup, repetition visualization",
    "mandala forming and dissolving simultaneously, cyclical pattern",
    "maze from bird's eye view, life patterns concept, noir",
    "seasons wheel turning continuously, natural cycles art",
    "domino chain arranged in perfect circle, eternal loop",
    "fibonacci spiral in abstract golden form, dark background",
    "sound echo visualized as repeating golden waves in darkness",
    "mirror reflecting infinite mirrors, recursion concept art",
    "tree branches forming perfect fractal patterns, dark sky",
    "ripples overlapping in still dark water, interference pattern",
    "habit loop visualization, trigger action reward cycle art",
    "same road traveled many times, worn path in darkness",
    "multiple clock faces all showing same time, repetition",
    "DNA double helix glowing in darkness, life pattern art",
    "moth eternally circling lamp, attraction pattern concept",
    "tide marks on dark beach, rhythmic pattern visualization",
    "circular staircase going nowhere, endless loop concept",
    "neural network visualization, glowing thought patterns",
    "calendar showing same day repeating infinitely, groundhog",
    "broken chain trying to reform itself, habit breaking art",
    "chaos particles becoming ordered, pattern emergence concept",
    "quantum probability clouds, pattern uncertainty visualization",
    "constellation lines connecting random stars, pattern seeking"
  ],
  memory: [
    "fading polaroid photograph floating in darkness, memory decay",
    "brain as vast library with scattered floating books, memory storage",
    "foggy mirror showing faint past reflection, memory concept",
    "old photograph burning at edges, memory loss visualization",
    "childhood toy held in adult weathered hand, nostalgia art",
    "footprints being washed away by dark tide, forgetting",
    "journal pages flying away in wind, scattered memories",
    "empty ornate picture frame, forgotten face concept art",
    "road behind disappearing into thick fog, past fading",
    "broken antique music box, forgotten melody concept",
    "tree trunk with carved initials fading away, time eroding",
    "sandcastle being reclaimed by dark sea, impermanence art",
    "film reel unspooling into void, memory stream concept",
    "ghost of former self standing behind, identity memory",
    "dusty attic full of covered furniture, stored memories",
    "old letters bundled with fading ribbon, correspondence memories",
    "clock face with blurred unreadable numbers, time confusion",
    "forest path becoming overgrown and lost, forgotten way",
    "lighthouse beam searching through thick fog, seeking memory",
    "jigsaw puzzle with missing pieces, incomplete memory art",
    "echo fading in vast canyon, sound memory visualization",
    "perfume bottle with memories emanating, scent trigger art",
    "ancient ruins crumbling, forgotten civilizations concept",
    "child's drawing on old fridge, innocent memory art",
    "gravestone with fresh flowers, honoring memory concept"
  ]
};

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
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function generateImage(
  openai: OpenAI,
  prompt: string,
  category: string,
  index: number
): Promise<string | null> {
  console.log(`\n📸 Generating ${category}_${String(index).padStart(3, '0')}...`);
  console.log(`   Prompt: ${prompt.substring(0, 50)}...`);

  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "512x512",
    });

    if (response.data && response.data[0]?.url) {
      return response.data[0].url;
    }
    return null;
  } catch (error) {
    console.error(`   ❌ Error: ${error}`);
    return null;
  }
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  console.log('🎨 Gozlem DALL-E Image Generator');
  console.log('================================\n');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🖼️  Images per category: ${IMAGES_PER_CATEGORY}`);
  console.log(`📊 Total images: ${Object.keys(CATEGORY_PROMPTS).length * IMAGES_PER_CATEGORY}`);

  // Ensure output directories exist
  for (const category of Object.keys(CATEGORY_PROMPTS)) {
    const dir = path.join(OUTPUT_DIR, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  let totalGenerated = 0;
  let totalFailed = 0;

  for (const [category, prompts] of Object.entries(CATEGORY_PROMPTS)) {
    console.log(`\n\n🎯 Category: ${category.toUpperCase()}`);
    console.log('─'.repeat(40));

    for (let i = 0; i < IMAGES_PER_CATEGORY; i++) {
      const prompt = prompts[i % prompts.length];
      const filename = `${category}_${String(i + 1).padStart(3, '0')}.png`;
      const filepath = path.join(OUTPUT_DIR, category, filename);

      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`   ⏭️  ${filename} already exists, skipping`);
        totalGenerated++;
        continue;
      }

      const imageUrl = await generateImage(openai, prompt, category, i + 1);

      if (imageUrl) {
        try {
          await downloadImage(imageUrl, filepath);
          console.log(`   ✅ Saved: ${filename}`);
          totalGenerated++;
        } catch (err) {
          console.error(`   ❌ Failed to save: ${err}`);
          totalFailed++;
        }
      } else {
        totalFailed++;
      }

      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n\n📊 Summary');
  console.log('═'.repeat(40));
  console.log(`✅ Generated: ${totalGenerated}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📁 Location: ${OUTPUT_DIR}`);
}

main().catch(console.error);
