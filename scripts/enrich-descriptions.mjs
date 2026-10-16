import fs from 'fs';
import path from 'path';

const JSON_PATH = path.resolve('src/data/crawled_watches.json');
const CSV_PATH = path.resolve('public/clonewatches_master_catalog.csv');

const rawData = fs.readFileSync(JSON_PATH, 'utf-8');
const products = JSON.parse(rawData);

console.log(`Enriching ${products.length} products with 100% full detail (Calibre Engine + Technical Specifications + Data Sheet Table + HTML Magazine Showcase)...`);

function getModelDetails(product) {
  const brand = product.brand || 'Rolex';
  const name = product.name || 'Master Clone Watch';
  const lower = name.toLowerCase();
  const collection = product.collection || 'Signature Series';
  const factory = (product.factory || 'VSF / Clean Factory').split('/')[0].trim();

  // Extract reference number or model code
  const refMatch = name.match(/m?\d{4,6}[a-zA-Z0-9-]*/i);
  const refCode = refMatch ? refMatch[0].toUpperCase() : (product.spu || '1:1 Edition');

  // Nickname detection
  let nickname = '';
  if (lower.includes('bruce wayne')) nickname = '“Bruce Wayne”';
  else if (lower.includes('batman')) nickname = '“Batman”';
  else if (lower.includes('pepsi')) nickname = '“Pepsi”';
  else if (lower.includes('starbucks')) nickname = '“Starbucks”';
  else if (lower.includes('kermit')) nickname = '“Kermit”';
  else if (lower.includes('hulk')) nickname = '“Hulk”';
  else if (lower.includes('smurf')) nickname = '“Smurf”';
  else if (lower.includes('panda')) nickname = '“Panda”';
  else if (lower.includes('root beer') || lower.includes('rootbeer')) nickname = '“Root Beer”';
  else if (lower.includes('sprite') || lower.includes('destro')) nickname = '“Sprite”';
  else if (lower.includes('tiffany')) nickname = '“Tiffany Blue”';
  else if (lower.includes('john mayer')) nickname = '“John Mayer Gold”';
  else if (lower.includes('ghost')) nickname = '“Ghost”';
  else if (lower.includes('wimbledon')) nickname = '“Wimbledon”';
  else if (lower.includes('le mans')) nickname = '“Le Mans”';
  else if (lower.includes('celebration')) nickname = '“Celebration Motif”';

  // Bracelet detection
  let braceletType = 'Oyster';
  let braceletTitle = 'Solid 904L Oyster Bracelet';
  let braceletDesc = 'Solid 904L Oystersteel 3-link bracelet with milled Glidelock extension clasp, offering 2mm incremental sizing adjustments.';

  if (lower.includes('jubilee')) {
    braceletType = 'Jubilee';
    braceletTitle = 'Jubilee Elegance';
    braceletDesc = 'The 5-link Jubilee bracelet offers superior comfort and a sophisticated look. VSF has refined the link articulation to ensure a silky-smooth drape on the wrist.';
  } else if (lower.includes('president') || lower.includes('presidential')) {
    braceletType = 'President';
    braceletTitle = 'President Semi-Circular 3-Link';
    braceletDesc = 'Refined semi-circular 3-piece solid link President bracelet with concealed Crownclasp folding mechanism and ceramic pipe inserts.';
  } else if (lower.includes('oysterflex') || lower.includes('rubber')) {
    braceletType = 'Oysterflex';
    braceletTitle = 'Oysterflex High-Performance Elastomer';
    braceletDesc = 'Flexible metal blade overmoulded with high-performance black elastomer and patented longitudinal cushions for supreme wrist stability.';
  } else if (lower.includes('leather')) {
    braceletType = 'Leather';
    braceletTitle = 'Hand-Stitched Alligator Leather';
    braceletDesc = 'Genuine Italian calf leather crafted with matte scales and deployant folding clasp with micro-adjustment.';
  }

  // 1. ROLEX GMT-MASTER II
  if (lower.includes('gmt') || collection.toLowerCase().includes('gmt')) {
    const bezelTitle = nickname.includes('Bruce Wayne')
      ? 'Black & Grey Cerachrom'
      : nickname.includes('Pepsi')
      ? 'Red & Blue Cerachrom'
      : nickname.includes('Batman')
      ? 'Blue & Black Cerachrom'
      : nickname.includes('Sprite')
      ? 'Green & Black Cerachrom'
      : nickname.includes('Root Beer')
      ? 'Black & Brown Cerachrom'
      : 'Bi-Color Cerachrom Bezel';

    const cleanTitle = `${brand} GMT-Master II ${nickname} ${refCode}: The ${factory} Ultimate ${braceletType} Edition`.replace(/\s+/g, ' ').trim();
    const tagline = `Stealth, Precision, Elegance. Featuring the market-leading Dandong DD3285 Movement, the flawless ${bezelTitle}, and the luxurious ${braceletType} Bracelet.`;

    return {
      titleLine: cleanTitle,
      tagline,
      calibre: {
        headline: 'POWERED BY DANDONG DD3285',
        summary: `Reliability is luxury. Unlike cheaper “modified” movements, this ${factory} ${nickname || 'GMT-Master II'} is powered by the custom-engineered Dandong 3285.`,
        bullets: [
          { title: '72-Hour Power Reserve', desc: 'A true weekend-proof watch with high-efficiency chronergy escapement.' },
          { title: 'True GMT Function', desc: 'Independent “Jumping Hour” hand for rapid time zone adjustment, exactly like the genuine Caliber 3285.' },
          { title: 'Correct Hand Stack', desc: 'The hour hand sits correctly relative to the GMT hand (ICHS), a critical detail for collectors.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: bezelTitle,
          desc: `The defining feature of this edition. ${factory} has mastered the subtle transition between colored ceramic segments. The numerals are PVD platinum-coated for a sharp, enduring luster.`
        },
        crystal: {
          label: 'CRYSTAL',
          title: `${factory} “Deep” Clarity`,
          desc: `${factory} is famous for its crystal quality. It offers industry-leading transparency, making the black dial pop. The cyclops features the correct “Black Hole” effect with high-grade AR coating.`
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '12.1mm Thin',
          desc: `Thanks to the slim DD3285 movement, ${factory} achieves the exact 12.1mm case thickness of the original. It slides effortlessly under a dress shirt cuff.`
        },
        bracelet: {
          label: 'BRACELET',
          title: braceletTitle,
          desc: braceletDesc
        }
      },
      dataSheet: {
        modelReference: `GMT-Master II ${refCode} (${braceletType})`,
        factoryVersion: `${factory} Ultimate Edition`,
        movement: 'Dandong DD3285 (72h Reserve)',
        bezel: `${bezelTitle} (Seamless)`,
        caseMaterial: 'Solid 904L Oystersteel',
        bracelet: `${braceletType} with Easylink 5mm Comfort Extension`,
        caseDimensions: '40 mm x 12.1 mm (Exact Thickness)',
        waterResistance: '50 Meters (Pressure Tested)'
      }
    };
  }

  // 2. ROLEX DAYTONA
  if (lower.includes('daytona') || collection.toLowerCase().includes('daytona')) {
    const isGold = lower.includes('gold') || lower.includes('116508') || lower.includes('116518') || nickname.includes('John Mayer');
    const isOysterflex = braceletType === 'Oysterflex';
    const cleanTitle = `${brand} Cosmograph Daytona ${nickname} ${refCode}: The ${factory} Dandong 4130 Super Clone Edition`.replace(/\s+/g, ' ').trim();

    return {
      titleLine: cleanTitle,
      tagline: `Motorsport Precision & Ultra-Slim Profile. Powered by the Dandong DD4130 Calibre with fully functional column-wheel chronograph and ceramic tachymeter bezel.`,
      calibre: {
        headline: 'POWERED BY DANDONG DD4130',
        summary: `The pinnacle of chronograph replication. Built with a bespoke integrated 4130 movement that eliminates unnecessary plates and ticking stutter.`,
        bullets: [
          { title: '72-Hour Power Reserve', desc: 'Full weekend autonomous power reserve with bi-directional self-winding ball-bearing rotor.' },
          { title: 'Column Wheel Chronograph', desc: 'Crisp mechanical tactile pusher response with genuine 12-hour and 30-minute functional subdial tracking.' },
          { title: 'True 1:1 Thickness (12.2mm)', desc: 'Identical case height to genuine Daytona, unlike bulky 7750 clone modifications.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: isGold ? 'Engraved Gold Tachymetric Bezel' : 'Cerachrom Tachymeter',
          desc: 'High-tech monobloc ceramic with molded tachymetric scale. Recessed numerals deposited with platinum or gold via PVD for authentic reflectivity.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Flush-Mounted Sapphire',
          desc: 'Optically clear synthetic sapphire crystal seated perfectly flush against the bezel rim with invisible laser-etched crown at 6 o’clock.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '12.2mm Ultra-Slim',
          desc: 'Precision CNC-machined from solid 904L steel with authentic sweeping flank polish and screw-down Triplock chronograph pushers.'
        },
        bracelet: {
          label: 'BRACELET',
          title: isOysterflex ? 'Oysterflex Elastomer System' : 'Solid 904L Oyster Bracelet',
          desc: isOysterflex ? 'Titanium-nickel alloy core cushion blade overmoulded with luxury elastomer.' : 'Solid 3-link Oyster bracelet with Oysterlock safety clasp and 5mm Easylink extension.'
        }
      },
      dataSheet: {
        modelReference: `Cosmograph Daytona ${refCode} ${nickname}`.trim(),
        factoryVersion: `${factory} Dandong 4130 Super Clone`,
        movement: 'Dandong Calibre 4130 (Integrated Chrono, 72h)',
        bezel: isGold ? 'Mirror-Polished 18k PVD Tachymeter Bezel' : 'Monobloc Cerachrom with Platinum PVD Tachymeter',
        caseMaterial: isGold ? 'Solid 904L Steel with 18k Gold PVD Coating' : 'Solid 904L Oystersteel',
        bracelet: isOysterflex ? 'Oysterflex Elastomer with Glidelock Clasp' : 'Solid 904L Oyster with Oysterlock Clasp',
        caseDimensions: '40 mm x 12.2 mm (True 1:1 Height)',
        waterResistance: '100 Meters (Vacuum & Wet Pressure Tested)'
      }
    };
  }

  // 3. ROLEX SUBMARINER
  if (lower.includes('submariner') || collection.toLowerCase().includes('submariner')) {
    const isNoDate = lower.includes('no date') || lower.includes('124060') || lower.includes('114060');
    const bezelColor = nickname.includes('Hulk') ? 'Emerald Green Cerachrom'
      : nickname.includes('Starbucks') || nickname.includes('Kermit') ? 'Ceragold Olive Green Cerachrom'
      : nickname.includes('Smurf') ? 'Royal Blue Cerachrom'
      : 'Glossy Black Cerachrom';

    const calName = isNoDate ? 'Dandong Calibre 3230' : (lower.includes('116610') ? 'Dandong Calibre 3135' : 'Dandong Calibre 3235');

    return {
      titleLine: `${brand} Submariner Date ${nickname} ${refCode}: The ${factory} Master Diver Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `The Gold Standard of Ocean Tool Watches. Equipped with the legendary Dandong movement, uni-directional 120-click ceramic bezel, and Glidelock bracelet.`,
      calibre: {
        headline: `POWERED BY ${calName.toUpperCase()}`,
        summary: `${factory} sets the benchmark with the custom-cloned ${calName}. Features a genuine blue Parachrom hairspring, free-sprung balance, and instantaneous date mechanism.`,
        bullets: [
          { title: '70-Hour Power Reserve', desc: 'Extended autonomous running power with optimized mainspring barrel geometry.' },
          { title: 'Glidelock Micro-Adjustment', desc: 'Patented clasp adjustment system allowing 20mm of fine-tuning without any tools.' },
          { title: 'Instantaneous Midnight Date', desc: 'Date changes instantly within milliseconds at midnight without preliminary slow roll.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: bezelColor,
          desc: 'Uni-directional 120-click rotating ceramic bezel with platinum-sputtered gradations and luminescent capsule pip at 12 o’clock.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: `${factory} Deep Crystal`,
          desc: 'Double AR-coated cyclops magnifying lens providing authentic 2.5x magnification with anti-reflective black hole effect.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '41mm Refined Lugs (12.3mm)',
          desc: 'Redesigned slimmer lug profile matching genuine 41mm case proportions. Finished with satin circular brushing on top and mirror flanks.'
        },
        bracelet: {
          label: 'BRACELET',
          title: 'Solid 904L Oyster with Glidelock',
          desc: 'Heavyweight solid link Oyster bracelet with authentic milled Glidelock sliding extension and laser-engraved clasp codes.'
        }
      },
      dataSheet: {
        modelReference: `Submariner ${isNoDate ? 'No-Date' : 'Date'} ${refCode} ${nickname}`.trim(),
        factoryVersion: `${factory} Master Edition`,
        movement: `${calName} (70h Reserve, 28,800 VPH)`,
        bezel: `${bezelColor} (120-Click Uni-Directional)`,
        caseMaterial: 'Solid 904L Oystersteel',
        bracelet: 'Solid 904L Oyster with Glidelock Fine-Adjustment Clasp',
        caseDimensions: '41 mm x 12.3 mm (1:1 Proportions)',
        waterResistance: '300 Meters (Professional Submersible Seal)'
      }
    };
  }

  // 4. ROLEX DAY-DATE (President)
  if (lower.includes('day date') || lower.includes('day-date') || collection.toLowerCase().includes('day-date')) {
    const isTungsten = lower.includes('tungsten') || lower.includes('heavy') || lower.includes('qf');
    const cleanTitle = `${factory} Rolex Day-Date 40 ${nickname} ${refCode}: The ${isTungsten ? 'Heavy Tungsten' : 'Ultimate'} Edition`.replace(/\s+/g, ' ').trim();

    return {
      titleLine: cleanTitle,
      tagline: `Prestige, Dignity, Substance. Crafted with custom ${isTungsten ? 'Tungsten-weighted heavy core' : '904L alloy'}, fluted bezel, and dual calendar day-date display.`,
      calibre: {
        headline: 'POWERED BY CALIBRE 3255 CLONE',
        summary: `Equipped with the high-precision 3255 automatic calibre featuring simultaneous instantaneous jump of the day and date discs at midnight.`,
        bullets: [
          { title: '70-Hour Power Reserve', desc: 'Autonomous weekend power reserve with bidirectional self-winding rotor.' },
          { title: 'Dual Instantaneous Jump', desc: 'Both day-of-the-week arc window and date aperture switch crisply at 12:00:00 midnight.' },
          { title: isTungsten ? 'Authentic 185g Weight' : 'Solid Substantial Feel', desc: isTungsten ? 'Tungsten alloy core achieves authentic genuine hand-feel weight (185g vs standard 135g).' : 'Solid link construction ensuring genuine luxury wrist presence.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: 'Iconic Fluted Bezel',
          desc: 'Sharp diamond-cut geometric fluting with mirror-polished facets reflecting light with mesmerizing depth.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'AR-Coated Sapphire',
          desc: 'Ultra-clear scratch-resistant sapphire crystal with Cyclops lens magnifying date aperture by 2.5 times.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '40mm Oyster Case (12.0mm)',
          desc: 'Classic Oyster silhouette with monobloc middle case, screw-down caseback, and Twinlock double water-resistance system.'
        },
        bracelet: {
          label: 'BRACELET',
          title: 'President Bracelet',
          desc: 'Semi-circular 3-piece links fitted with ceramic inserts inside the links to prevent stretching and maintain lifelong rigidity.'
        }
      },
      dataSheet: {
        modelReference: `Day-Date 40 ${refCode}`,
        factoryVersion: isTungsten ? 'QF (Q Factory) / 185g Weighted Version' : `${factory} Ultimate Edition`,
        movement: 'Super Clone 3255 Automatic (70h Reserve)',
        bezel: 'Precision Fluted Solid Bezel (Mirror Polished)',
        caseMaterial: isTungsten ? 'Tungsten Alloy Core with 18K Heavy Gold PVD' : 'Solid 904L Steel with 18k PVD Plating',
        bracelet: 'President (Semi-Circular 3-Link) with Concealed Crownclasp',
        caseDimensions: '40 mm x 12.0 mm (Exact Thickness)',
        waterResistance: '50 Meters (Pressure Tested)'
      }
    };
  }

  // 5. ROLEX DATEJUST
  if (lower.includes('datejust') || collection.toLowerCase().includes('datejust')) {
    const isFluted = lower.includes('fluted') || !lower.includes('smooth');
    const isJubilee = lower.includes('jubilee');
    const size = lower.includes('36') ? '36mm' : '41mm';

    return {
      titleLine: `${brand} Datejust ${size} ${nickname} ${refCode}: The ${factory} Classic Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Timeless Horological Elegance. Featuring the Dandong Calibre 3235, sunray dial finish, and comfortable ${isJubilee ? 'Jubilee' : 'Oyster'} bracelet.`,
      calibre: {
        headline: 'POWERED BY DANDONG CALIBRE 3235',
        summary: `The gold standard for everyday luxury. Built with genuine clone 3235 movement featuring 70 hours autonomous power reserve.`,
        bullets: [
          { title: '70-Hour Power Reserve', desc: 'Weekend-proof autonomous power reserve engineered with high-efficiency escapement.' },
          { title: 'Instantaneous Date Jump', desc: 'Rapid calendar adjustment with crisp midnight switch.' },
          { title: 'True Smooth Sweep', desc: '28,800 beats per hour smooth seconds sweep with regulated timekeeping.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: isFluted ? 'Diamond-Cut Fluted Bezel' : 'Smooth Polished Bezel',
          desc: isFluted ? 'Laser-sharpened fluted facets electroplated for authentic white-gold or yellow-gold luster.' : 'Seamless mirror-polished dome bezel contouring smoothly with the crystal.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: `${factory} Deep Sapphire`,
          desc: 'High-purity sapphire crystal with 2.5x cyclops magnification and high-transmission anti-reflective coating.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: `${size} Ergonomic Case (11.7mm)`,
          desc: 'Slim profile designed to fit flawlessly under shirts, with sweeping lug tapers and screw-down Twinlock crown.'
        },
        bracelet: {
          label: 'BRACELET',
          title: isJubilee ? '5-Link Jubilee Bracelet' : 'Solid Oyster Bracelet',
          desc: isJubilee ? 'Five-piece flexible link Jubilee bracelet with concealed Easylink 5mm extension.' : 'Three-piece solid Oyster links with Oysterclasp and folding link extension.'
        }
      },
      dataSheet: {
        modelReference: `Datejust ${size} ${refCode} ${nickname}`.trim(),
        factoryVersion: `${factory} Classic Edition`,
        movement: 'Dandong Calibre 3235 (70h Reserve)',
        bezel: isFluted ? 'Diamond-Cut Fluted Bezel (Gold/Steel PVD)' : 'Smooth Domed Mirror Polished Bezel',
        caseMaterial: 'Solid 904L Oystersteel',
        bracelet: `${isJubilee ? 'Jubilee' : 'Oyster'} with Easylink 5mm Comfort Extension`,
        caseDimensions: `${size} x 11.7 mm (Authentic Thin Profile)`,
        waterResistance: '100 Meters (Vacuum & Wet Pressure Tested)'
      }
    };
  }

  // 6. ROLEX OYSTER PERPETUAL / AIR-KING / EXPLORER
  if (lower.includes('oyster perpetual') || lower.includes('air king') || lower.includes('air-king') || lower.includes('explorer') || collection.toLowerCase().includes('oyster perpetual')) {
    const isOp = lower.includes('oyster perpetual');
    const isExp = lower.includes('explorer');
    const isAir = lower.includes('air king') || lower.includes('air-king');
    const modelFamily = isOp ? 'Oyster Perpetual' : (isExp ? 'Explorer' : 'Air-King');

    return {
      titleLine: `${brand} ${modelFamily} ${nickname} ${refCode}: The ${factory} Pure Horology Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Purity, Durability, Simplicity. Equipped with the Dandong 3230 no-date movement, solid 904L steel case, and iconic lacquered dial.`,
      calibre: {
        headline: 'POWERED BY DANDONG CALIBRE 3230',
        summary: `True no-date automatic mechanical calibre with no ghost-date crown position, offering pure two-position winding and time-setting.`,
        bullets: [
          { title: '70-Hour Power Reserve', desc: 'Extended autonomous running power with optimized mainspring barrel geometry.' },
          { title: 'No Ghost Date Position', desc: 'Crown pulls directly from winding to time-setting, matching genuine Caliber 3230.' },
          { title: 'Paramagnetic Hairspring', desc: 'Blue Parachrom clone hairspring providing superior stability against temperature shocks.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: 'Smooth Domed Bezel',
          desc: 'Seamless mirror-polished dome bezel crafted from solid 904L Oystersteel.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Flat Scratch-Proof Sapphire',
          desc: 'Optically pure flat synthetic sapphire with internal anti-reflective coating.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '41mm Oyster Case (11.6mm)',
          desc: 'Classic proportioned middle case with satin brushed top surfaces and polished case flanks.'
        },
        bracelet: {
          label: 'BRACELET',
          title: 'Solid 904L Oyster Bracelet',
          desc: 'Solid 3-link Oyster bracelet with Oysterclasp and patented Easylink 5mm comfort extension.'
        }
      },
      dataSheet: {
        modelReference: `${modelFamily} ${refCode} ${nickname}`.trim(),
        factoryVersion: `${factory} Super Clone`,
        movement: 'Dandong Calibre 3230 (No-Date, 70h Reserve)',
        bezel: 'Smooth Domed Solid 904L Bezel',
        caseMaterial: 'Solid 904L Oystersteel',
        bracelet: 'Solid 904L Oyster with Easylink 5mm Comfort Extension',
        caseDimensions: '41 mm x 11.6 mm (1:1 Proportions)',
        waterResistance: '100 Meters (Vacuum & Wet Pressure Tested)'
      }
    };
  }

  // 7. ROLEX YACHT-MASTER / SEA-DWELLER
  if (lower.includes('yacht-master') || lower.includes('yachtmaster') || lower.includes('sea-dweller') || lower.includes('seadweller')) {
    const isYm = lower.includes('yacht');
    const isOysterflex = braceletType === 'Oysterflex';

    return {
      titleLine: `${brand} ${isYm ? 'Yacht-Master' : 'Sea-Dweller'} ${nickname} ${refCode}: The ${factory} Marine Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `The Spirit of Nautical Adventure. Featuring bidirectional sandblasted platinum/ceramic bezel, Dandong movement, and high-performance ergonomics.`,
      calibre: {
        headline: 'POWERED BY DANDONG CALIBRE 3235',
        summary: `Engineered for demanding offshore conditions with robust shock absorption and high-beat precision regulation.`,
        bullets: [
          { title: '70-Hour Power Reserve', desc: 'Autonomous running capability with high-yield mainspring geometry.' },
          { title: 'Triplock Triple Waterproof', desc: 'Screw-down winding crown with 3 sealed zones for ultimate marine protection.' },
          { title: 'Instantaneous Date Mechanism', desc: 'Quick-setting date with crisp midnight switch.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: isYm ? 'Sandblasted Cerachrom / Platinum' : 'Ceramic 60-Minute Graduated',
          desc: isYm ? 'Bidirectional rotatable bezel with raised polished numerals standing out against matte sandblasted background.' : 'Unidirectional 60-minute rotatable bezel with platinum recessed graduations.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: `${factory} Deep Sapphire`,
          desc: 'Scratch-resistant sapphire crystal with Cyclops lens over the date and anti-reflective coating.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: isYm ? '40mm / 42mm Sculpted Case (11.8mm)' : '43mm Deep Case (15.2mm)',
          desc: isYm ? 'Curved lugs sculpted specifically for nautical elegance and ergonomic wrist contact.' : 'Robust deep-sea case with helium escape valve.'
        },
        bracelet: {
          label: 'BRACELET',
          title: isOysterflex ? 'Oysterflex Elastomer Bracelet' : 'Solid 904L Oyster Bracelet',
          desc: isOysterflex ? 'Flexible titanium alloy blade encased in high-performance black elastomer with Glidelock.' : 'Solid 904L Oystersteel with Fliplock diver extension.'
        }
      },
      dataSheet: {
        modelReference: `${isYm ? 'Yacht-Master' : 'Sea-Dweller'} ${refCode}`,
        factoryVersion: `${factory} Marine Edition`,
        movement: 'Dandong Calibre 3235 (70h Reserve)',
        bezel: isYm ? 'Bidirectional Sandblasted Platinum/Ceramic Bezel' : 'Unidirectional Ceramic Diver Bezel',
        caseMaterial: 'Solid 904L Oystersteel',
        bracelet: isOysterflex ? 'Oysterflex High-Performance Elastomer with Glidelock' : 'Solid 904L Oyster with Glidelock Extension',
        caseDimensions: isYm ? '40 mm x 11.8 mm (Slim Profile)' : '43 mm x 15.2 mm (Deep Sea Profile)',
        waterResistance: isYm ? '100 Meters (Pressure Tested)' : '300 Meters (Submersible Seal)'
      }
    };
  }

  // 8. OMEGA SEAMASTER & SPEEDMASTER
  if (brand.toLowerCase().includes('omega') || lower.includes('seamaster') || lower.includes('speedmaster') || lower.includes('aqua terra')) {
    const isSpeedy = lower.includes('speedmaster') || lower.includes('moonwatch');
    const isAqua = lower.includes('aqua terra');
    const modelFamily = isSpeedy ? 'Speedmaster Professional Moonwatch' : (isAqua ? 'Seamaster Aqua Terra 150M' : 'Seamaster Diver 300M');

    return {
      titleLine: `${brand} ${modelFamily} ${nickname} ${refCode}: The ${factory} Co-Axial Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Maritime Excellence & Space Exploration Heritage. Featuring the custom VSF cloned Co-Axial Calibre, ceramic wave dial, and exhibition sapphire caseback.`,
      calibre: {
        headline: isSpeedy ? 'POWERED BY CALIBRE 1861/3861 CLONE' : 'POWERED BY VSF CUSTOM CO-AXIAL 8800/8900',
        summary: `VSF is undisputed #1 for Omega replicas. Features an authentic black balance wheel at 12 o’clock, Côtes de Genève in Arabesque decoration, and genuine jumping hour hand.`,
        bullets: [
          { title: 'True Black Balance Wheel', desc: 'Positioned at the exact authentic angle, unlike cheap decorated Miyota plates.' },
          { title: '55-Hour Power Reserve', desc: 'Twin-barrel or single high-efficiency barrel architecture delivering continuous power.' },
          { title: 'Exhibition Caseback Display', desc: 'Sapphire display back showcasing full movement finishing with engraved red lettering.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: isSpeedy ? 'Tachymeter Scale Dot-Over-90' : 'Zirconia Ceramic Bezel Ring',
          desc: isSpeedy ? 'Anodized aluminum or ceramic tachymeter bezel with historic Dot-Over-90 (DON) typography.' : 'Polished ceramic bezel ring filled with white enamel or Ceragold diving scale.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Domed Scratch-Resistant Sapphire',
          desc: 'Domed sapphire crystal with anti-reflective treatment on both inside and outside surfaces for invisible glass effect.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '42mm Twisted Lyre Lugs (13.5mm)',
          desc: 'Signature Omega twisted lyre lugs with brushed case body and conical Helium Escape Valve at 10 o’clock.'
        },
        bracelet: {
          label: 'BRACELET',
          title: isSpeedy ? 'Brushed-Polished Link Bracelet' : '5-Link Diver Bracelet / Rubber Strap',
          desc: 'Solid link construction with push-button foldover clasp featuring innovative diver rack-and-pusher micro-adjustment.'
        }
      },
      dataSheet: {
        modelReference: `${modelFamily} ${refCode}`,
        factoryVersion: 'VSF (VS Factory) Ultimate Edition',
        movement: isSpeedy ? 'Super Clone Manual Chronograph Movement' : 'VSF Custom Omega A8800 / A8900 Co-Axial Clone',
        bezel: isSpeedy ? 'Ceramic / Anodized Aluminum Tachymeter' : 'Polished Ceramic with White Enamel Diving Scale',
        caseMaterial: 'Solid 316L Stainless Steel',
        bracelet: 'Solid Stainless Steel with Push-Button Micro-Adjustment',
        caseDimensions: isSpeedy ? '42 mm x 13.2 mm' : '42 mm x 13.5 mm',
        waterResistance: isSpeedy ? '50 Meters' : '300 Meters (Professional Helium Valve)'
      }
    };
  }

  // 9. PATEK PHILIPPE NAUTILUS & AQUANAUT
  if (brand.toLowerCase().includes('patek') || lower.includes('nautilus') || lower.includes('aquanaut')) {
    const isAqua = lower.includes('aquanaut');
    const modelFamily = isAqua ? 'Aquanaut' : 'Nautilus';

    return {
      titleLine: `${brand} ${modelFamily} ${nickname} ${refCode}: The 3KF / PPF 1:1 Super Clone Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Haute Horlogerie Iconography. Engineered with the genuine-thickness 3KF Calibre 324 SC clone movement, satin-brushed octagonal bezel, and integrated case.`,
      calibre: {
        headline: 'POWERED BY 3KF BESPOKE CALIBRE 324 SC / 26-330 SC',
        summary: `The only true 1:1 cloned Patek movement on the market. Eliminates noisy decorative rotor plates by engineering every gear, bridge, and jewel from scratch.`,
        bullets: [
          { title: 'True 8.3mm Ultra-Slim Case', desc: 'Achieves identical genuine thickness, sitting flat and sublime on the wrist.' },
          { title: '21K Gold-Plated Rotor', desc: 'Heavy unidirectional winding rotor with engraved Calatrava cross and ceramic ball bearings.' },
          { title: 'Silent Mechanical Sweep', desc: 'De-coupled second wheel system ensuring completely silent and smooth 28,800 VPH sweep.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: 'Rounded Octagonal Bezel',
          desc: 'Vertically satin-brushed top face contrasted with mirror-beveled flanks, requiring over 55 hand-finishing operations.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Ultra-Thin Sapphire Crystal',
          desc: 'Precision laser-cut sapphire crystal seated tightly into the porthole bezel frame.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '8.3mm Ultra-Thin Profile',
          desc: 'Two-part monobloc case construction with lateral hinges (“ears”) replicating Gérald Genta’s legendary maritime porthole design.'
        },
        bracelet: {
          label: 'BRACELET',
          title: isAqua ? 'Tropical Composite Embossed Strap' : 'Integrated Steel Link Bracelet',
          desc: isAqua ? 'Hypoallergenic composite strap resistant to saltwater, UV radiation, and wear.' : 'Hand-finished articulating integrated links with fold-over butterfly clasp.'
        }
      },
      dataSheet: {
        modelReference: `${modelFamily} ${refCode} ${nickname}`.trim(),
        factoryVersion: '3KF (3K Factory) / PPF 1:1 Edition',
        movement: 'Custom Clone Calibre 324 SC / 26-330 SC Automatic',
        bezel: 'Rounded Octagonal Satin Brushed Bezel with Beveled Chamfers',
        caseMaterial: 'Solid 316L Stainless Steel',
        bracelet: isAqua ? 'High-Performance Tropical Composite Rubber' : 'Integrated Link Bracelet with Fold-Over Clasp',
        caseDimensions: '40 mm x 8.3 mm (Exact Genuine Ultra-Thin Height)',
        waterResistance: '120 Meters (Sealed Gaskets)'
      }
    };
  }

  // 10. AUDEMARS PIGUET ROYAL OAK & OFFSHORE
  if (brand.toLowerCase().includes('audemars') || lower.includes('royal oak')) {
    const isOffshore = lower.includes('offshore') || lower.includes('diver');
    const modelFamily = isOffshore ? 'Royal Oak Offshore' : 'Royal Oak';

    return {
      titleLine: `${brand} ${modelFamily} ${nickname} ${refCode}: The APS / ZF 1:1 Super Clone Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Avant-Garde Architectural Haute Horlogerie. Featuring the “Grande Tapisserie” guilloché dial, custom Calibre 4302 clone, and 8 hexagonal white gold screws.`,
      calibre: {
        headline: 'POWERED BY APS CUSTOM CALIBRE 4302 / 3120',
        summary: `A true clone calibre engineered with functional balance wheel bridge, authentic skeletonized rotor with AP monogram, and 70-hour power reserve.`,
        bullets: [
          { title: '70-Hour Power Reserve', desc: 'Extended power reserve operating at high-beat 28,800 vibrations per hour.' },
          { title: 'Skeletonized 22K Gold Rotor', desc: 'Bespoke openworked oscillating weight with hand-chamfered edges and AP relief.' },
          { title: '1:1 Case Thickness (10.4mm)', desc: 'Exact thickness profile matching genuine 15500 / 15400 Royal Oak.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: 'Octagonal with 8 Hexagonal Screws',
          desc: 'Iconic octagonal bezel held by 8 functional hexagonal screws aligned in perfect tangential symmetry.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Anti-Reflective Sapphire Crystal',
          desc: 'High-clarity corundum sapphire revealing the depth of the Guilloché Tapisserie squares.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: isOffshore ? '42mm Offshore Profile (14.2mm)' : '41mm Royal Oak Profile (10.4mm)',
          desc: 'Complex geometric case architecture with alternating satin-brushed lines and mirror-polished chamfers.'
        },
        bracelet: {
          label: 'BRACELET',
          title: 'Royal Oak Integrated Articulating Bracelet',
          desc: 'Tapering links engineered with diminishing widths and AP double-folding butterfly clasp.'
        }
      },
      dataSheet: {
        modelReference: `${modelFamily} ${refCode} ${nickname}`.trim(),
        factoryVersion: 'APS Factory / ZF Super Clone Edition',
        movement: 'APS Custom Clone Calibre 4302 (28,800 VPH, 70h Reserve)',
        bezel: 'Octagonal Brushed Steel with 8 Polished Hexagonal Screws',
        caseMaterial: 'Solid 316L Stainless Steel',
        bracelet: 'Integrated Articulating Steel Bracelet with AP Butterfly Clasp',
        caseDimensions: isOffshore ? '42 mm x 14.2 mm' : '41 mm x 10.4 mm (Exact 1:1 Thickness)',
        waterResistance: isOffshore ? '300 Meters (Diver Seal)' : '50 Meters (Pressure Tested)'
      }
    };
  }

  // 11. CARTIER (Santos, Tank, Ballon Bleu)
  if (brand.toLowerCase().includes('cartier') || lower.includes('santos') || lower.includes('tank') || lower.includes('ballon')) {
    const isSantos = lower.includes('santos');
    const isTank = lower.includes('tank');
    const isBallon = lower.includes('ballon');
    const modelFamily = isSantos ? 'Santos de Cartier' : (isTank ? 'Tank Française' : (isBallon ? 'Ballon Bleu' : 'Cartier Collection'));

    return {
      titleLine: `${brand} ${modelFamily} ${nickname} ${refCode}: The BVF / AF 1:1 Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Parisian Sophistication & Timeless Geometry. Featuring the Calibre 1847 MC, cabochon sapphire crown, and SmartLink interchangeable bracelet system.`,
      calibre: {
        headline: 'POWERED BY CALIBRE 1847 MC / CITIZEN MIYOTA 9015',
        summary: `Equipped with an ultra-slim Japanese Miyota 9015 high-beat movement or cloned 1847 MC, providing lifelong reliability and silent winding.`,
        bullets: [
          { title: 'Ultra-Slim 9.38mm Case', desc: 'Slips under dress cuffs with effortless aristocratic elegance.' },
          { title: 'High-Beat 28,800 VPH', desc: 'Smooth sweeping blued steel sword hands across silvered opaline dial.' },
          { title: 'SmartLink & QuickSwitch', desc: 'Tool-free link removal and 1-second strap swapping system.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: isSantos ? 'Mirror-Polished Bezel with 8 Screws' : 'Curved Integrated Bezel',
          desc: 'High-polish bezel flowing smoothly into the case flanks, secured with screws.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Curved Sapphire Crystal',
          desc: 'Slightly domed sapphire crystal offering distortion-free legibility of Roman numerals.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '39.8mm Ergonomic Contour (9.38mm)',
          desc: 'Gentle ergonomic curvature that conforms naturally to the wrist contour.'
        },
        bracelet: {
          label: 'BRACELET',
          title: 'QuickSwitch & SmartLink Bracelet',
          desc: 'Solid link bracelet with patented push-button link removal mechanism.'
        }
      },
      dataSheet: {
        modelReference: `${modelFamily} ${refCode}`,
        factoryVersion: 'BVF (BV Factory) / AF 1:1 Edition',
        movement: 'Calibre 1847 MC / High-Beat Automatic Movement',
        bezel: 'Mirror-Polished Bezel with Functional Screws',
        caseMaterial: 'Solid 316L Stainless Steel',
        bracelet: 'Solid Steel with SmartLink Tool-Free Adjustment',
        caseDimensions: '39.8 mm x 9.38 mm (Ultra-Slim)',
        waterResistance: '100 Meters (Vacuum Tested)'
      }
    };
  }

  // 12. PANERAI (Luminor, Submersible, Radiomir)
  if (brand.toLowerCase().includes('panerai') || lower.includes('luminor') || lower.includes('submersible') || lower.includes('pam')) {
    const isSub = lower.includes('submersible');
    const isCarbotech = lower.includes('carbotech');
    const modelFamily = isSub ? 'Submersible' : 'Luminor Marina';

    return {
      titleLine: `${brand} ${modelFamily} ${nickname} ${refCode}: The VSF P.9010 Super Clone Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Italian Naval Command Heritage. Powered by the bespoke VSF cloned P.9000 / P.9010 movement, trademarked crown-lock lever, and Super-LumiNova sandwich dial.`,
      calibre: {
        headline: 'POWERED BY VSF BESPOKE CALIBRE P.9010 / P.9000',
        summary: `VSF is the undisputed master of Panerai replicas. Custom-built calibre with correct 11 o’clock balance wheel position and independent jumping hour hand.`,
        bullets: [
          { title: '72-Hour Power Reserve', desc: 'Extended power reserve with smooth automatic bidirectional winding.' },
          { title: 'Independent Hour Hand', desc: 'Allows hour-jumping adjustment forward and backward without stopping seconds hand.' },
          { title: 'Bespoke Balance Position', desc: 'Positioned at the exact authentic angle, identical to genuine Panerai manufacture movements.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: isSub ? 'Rotating Ceramic / Carbotech Bezel' : 'Smooth Polished Bezel',
          desc: 'Machined bezel with crisp tactile click and deep laser-engraved minute markers.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Thick Corundum Sapphire',
          desc: '2.6mm thick scratch-resistant sapphire crystal with anti-reflective coating.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '44mm Cushion Case (14.5mm)',
          desc: 'Signature 1950 cushion case with patented lever-activated crown protection bridge.'
        },
        bracelet: {
          label: 'BRACELET',
          title: 'Caoutchouc Rubber & Leather Straps',
          desc: 'High-density accordion rubber strap engineered for diving, with trapezoidal brushed buckle.'
        }
      },
      dataSheet: {
        modelReference: `${modelFamily} ${refCode}`,
        factoryVersion: 'VSF (VS Factory) Ultimate Edition',
        movement: 'VSF Custom Calibre P.9010 / P.9000 Automatic Clone',
        bezel: isSub ? 'Rotating Diver Bezel with Stud Markers' : 'Smooth Polished Steel Bezel',
        caseMaterial: isCarbotech ? 'Carbotech Carbon Fiber Composite' : 'Solid 316L Stainless Steel',
        bracelet: 'Panerai Accordion Caoutchouc Rubber Strap with Brushed Buckle',
        caseDimensions: '44 mm x 14.5 mm (Iconic Cushion Proportions)',
        waterResistance: '300 Meters (Professional Diving Pressure Tested)'
      }
    };
  }

  // 13. RICHARD MILLE (RM 011, RM 035, RM 055, RM 67-02)
  if (brand.toLowerCase().includes('richard mille') || lower.includes('rm ')) {
    const isCarbon = lower.includes('carbon') || lower.includes('ntpt');

    return {
      titleLine: `${brand} ${collection} ${nickname} ${refCode}: The ZF / Sonic Super Clone Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Racing Machine on the Wrist. Crafted with real NTPT forged carbon, skeletonized automatic movement, and ultra-lightweight aerodynamic architecture.`,
      calibre: {
        headline: 'POWERED BY SKELETONIZED HIGH-BEAT CALIBRE',
        summary: `Features a custom-finished skeletonized automatic movement with DLC-treated titanium baseplate and bridges.`,
        bullets: [
          { title: 'Bespoke Skeleton Architecture', desc: 'Fully visible gear train and balance wheel oscillating at 28,800 VPH.' },
          { title: 'Variable Geometry Rotor', desc: 'High-efficiency winding rotor decorated with authentic spline screws.' },
          { title: 'Ultra-Lightweight Construction', desc: 'Weighs under 45 grams, offering supreme sporting comfort on the wrist.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: isCarbon ? 'Real NTPT Layered Carbon Bezel' : 'Ceramic / Titanium Bezel',
          desc: 'Crafted from multi-layered carbon fiber producing unique organic Damascus-style wave patterns.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Curved Double-AR Sapphire',
          desc: 'Curved sapphire crystal treated with anti-glare coatings on both sides for 3D skeleton view.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: 'Ergonomic Tonneau Case (13.5mm)',
          desc: 'Tripartite curved tonneau case designed to mold perfectly to the wrist contours.'
        },
        bracelet: {
          label: 'BRACELET',
          title: 'Ventilated Rubber Strap',
          desc: 'High-performance vulcanized rubber strap with spring-loaded titanium folding deployant clasp.'
        }
      },
      dataSheet: {
        modelReference: `Richard Mille ${refCode} ${nickname}`.trim(),
        factoryVersion: 'ZF / Sonic Factory Super Clone',
        movement: 'Custom Skeletonized High-Beat Automatic Movement',
        bezel: isCarbon ? 'Genuine Layered NTPT Forged Carbon' : 'TZP Ceramic / Titanium',
        caseMaterial: isCarbon ? 'NTPT Carbon Fiber Composite & Titanium Core' : 'Grade 5 Titanium & Ceramic',
        bracelet: 'High-Performance Vulcanized Rubber Strap with Titanium Clasp',
        caseDimensions: '42.7 mm x 50.0 mm x 13.5 mm (1:1 Tonneau)',
        waterResistance: '50 Meters (Pressure Tested)'
      }
    };
  }

  // 14. BREITLING, VACHERON, HUBLOT, IWC, FRANCK MULLER, GENERIC LUXURY
  return {
    titleLine: `${brand} ${collection} ${refCode}: The ${factory} 1:1 Super Clone Edition`.replace(/\s+/g, ' ').trim(),
    tagline: `Precision, Prestige, Reliability. Featuring custom Swiss-calibrated movement, solid steel case, and scratch-resistant sapphire crystal.`,
    calibre: {
      headline: `POWERED BY ${product.movement?.toUpperCase() || 'CUSTOM SWISS CALIBRE'}`,
      summary: `Manufactured according to genuine horological tolerances. Powered by a factory-calibrated movement tuned for lasting durability and accuracy.`,
      bullets: [
        { title: 'Power Reserve Guarantee', desc: 'Extended autonomous running time engineered for worry-free daily luxury wear.' },
        { title: 'High-Beat 28,800 VPH', desc: 'Smooth sweeping second hand mimicking authentic mechanical fluidity.' },
        { title: 'Precision Factory Regulation', desc: 'Calibrated on electronic Timegrapher machines within +/- 3 seconds per day.' }
      ]
    },
    specs: {
      bezel: {
        label: 'THE BEZEL',
        title: product.bezel || 'Precision Machined Bezel',
        desc: 'Crafted with scratch-resistant materials, laser-etched markers, and refined tactile feedback.'
      },
      crystal: {
        label: 'CRYSTAL',
        title: product.crystal || `${factory} Scratch-Proof Sapphire`,
        desc: 'High-purity synthetic corundum sapphire crystal with optical-grade anti-reflective treatment.'
      },
      caseProfile: {
        label: 'CASE PROFILE',
        title: `${product.caseSize || '41mm'} Proportion`,
        desc: 'Engineered from solid 904L / 316L steel with authentic weight balance and refined ergonomic curvature.'
      },
      bracelet: {
        label: 'BRACELET',
        title: braceletTitle,
        desc: braceletDesc
      }
    },
    dataSheet: {
      modelReference: `${product.brand} ${product.collection} ${refCode}`,
      factoryVersion: `${factory} Super Clone Edition`,
      movement: product.movement || 'Custom Swiss Calibre Clone (28,800 VPH)',
      bezel: product.bezel || 'Polished / Brushed Bezel',
      caseMaterial: product.material || 'Solid 904L / 316L Stainless Steel',
      bracelet: braceletTitle,
      caseDimensions: `${product.caseSize || '41 mm'} x 12.0 mm`,
      waterResistance: product.waterResistance || '50 Meters (Pressure Tested)'
    }
  };
}

function generateRawHtml(product, details) {
  const { titleLine, tagline, calibre, specs, dataSheet } = details;

  // Video embed block (if product has Vimeo ID)
  let videoBlockHtml = '';
  if (product.qcVideoVimeoId) {
    videoBlockHtml = `
<div style="margin-bottom: 50px;">
<p style="font-size: 12px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">LIVE MOVEMENT PREVIEW (${product.name})</p>
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 0px; border: 1px solid #ccc;">
  <iframe frameborder="0" height="720" src="https://player.vimeo.com/video/${product.qcVideoVimeoId}?autoplay=0&loop=1" title="${product.name}" width="1280" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
</div>`;
  }

  return `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2c2c2c; line-height: 1.7; font-size: 16px;">
<div style="border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
<h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #000; margin-bottom: 10px; line-height: 1.2;">${titleLine}</h2>
<p style="font-size: 18px; color: #666; font-weight: 300; margin: 0;">${tagline}</p>
</div>
<div style="background-color: #f9f9f9; padding: 25px; border-left: 4px solid #4a4a4a; margin-bottom: 40px;">
<h3 style="font-family: 'Playfair Display', serif; font-size: 20px; color: #000; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">${calibre.headline}</h3>
<p style="margin-bottom: 15px;">${calibre.summary}</p>
<ul style="margin-bottom: 0; list-style: none; padding-left: 0;">
<li style="margin-bottom: 10px;"><strong>${calibre.bullets[0].title}:</strong> ${calibre.bullets[0].desc}</li>
<li style="margin-bottom: 10px;"><strong>${calibre.bullets[1].title}:</strong> ${calibre.bullets[1].desc}</li>
<li style="margin-bottom: 10px;"><strong>${calibre.bullets[2].title}:</strong> ${calibre.bullets[2].desc}</li>
</ul>
</div>
<div style="margin-bottom: 40px;">
<h3 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #000; margin-bottom: 25px;">Technical Specifications</h3>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
<div style="border-top: 1px solid #eee; padding-top: 15px;"><strong style="font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 1px;">${specs.bezel.label}</strong><br><span style="font-size: 17px; font-weight: bold; color: #222;">${specs.bezel.title}</span>
<p style="font-size: 14px; color: #555; margin-top: 8px;">${specs.bezel.desc}</p>
</div>
<div style="border-top: 1px solid #eee; padding-top: 15px;"><strong style="font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 1px;">${specs.crystal.label}</strong><br><span style="font-size: 17px; font-weight: bold; color: #222;">${specs.crystal.title}</span>
<p style="font-size: 14px; color: #555; margin-top: 8px;">${specs.crystal.desc}</p>
</div>
<div style="border-top: 1px solid #eee; padding-top: 15px;"><strong style="font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 1px;">${specs.caseProfile.label}</strong><br><span style="font-size: 17px; font-weight: bold; color: #222;">${specs.caseProfile.title}</span>
<p style="font-size: 14px; color: #555; margin-top: 8px;">${specs.caseProfile.desc}</p>
</div>
<div style="border-top: 1px solid #eee; padding-top: 15px;"><strong style="font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 1px;">${specs.bracelet.label}</strong><br><span style="font-size: 17px; font-weight: bold; color: #222;">${specs.bracelet.title}</span>
<p style="font-size: 14px; color: #555; margin-top: 8px;">${specs.bracelet.desc}</p>
</div>
</div>
</div>
${videoBlockHtml}
<div style="margin-bottom: 50px;">
<h3 style="font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 5px; color: #000;">Data Sheet</h3>
<div class="table-scroll-wrapper" style="overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; font-size: 15px; border: 1px solid #eee;">
<tbody>
<tr style="background-color: #f9f9f9;">
<td style="padding: 12px 15px; width: 30%; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">MODEL REFERENCE</td>
<td style="padding: 12px 15px; color: #555; border-bottom: 1px solid #ddd;">${dataSheet.modelReference}</td>
</tr>
<tr>
<td style="padding: 12px 15px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">FACTORY / VERSION</td>
<td style="padding: 12px 15px; color: #555; border-bottom: 1px solid #ddd;"><strong>${dataSheet.factoryVersion}</strong></td>
</tr>
<tr style="background-color: #eef2f5;">
<td style="padding: 12px 15px; font-weight: bold; color: #000; border-bottom: 1px solid #ddd;">MOVEMENT</td>
<td style="padding: 12px 15px; color: #000; font-weight: bold; border-bottom: 1px solid #ddd;">${dataSheet.movement}</td>
</tr>
<tr>
<td style="padding: 12px 15px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">BEZEL</td>
<td style="padding: 12px 15px; color: #555; border-bottom: 1px solid #ddd;">${dataSheet.bezel}</td>
</tr>
<tr>
<td style="padding: 12px 15px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">CASE MATERIAL</td>
<td style="padding: 12px 15px; color: #555; border-bottom: 1px solid #ddd;">${dataSheet.caseMaterial}</td>
</tr>
<tr>
<td style="padding: 12px 15px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">BRACELET</td>
<td style="padding: 12px 15px; color: #555; border-bottom: 1px solid #ddd;">${dataSheet.bracelet}</td>
</tr>
<tr>
<td style="padding: 12px 15px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">CASE DIMENSIONS</td>
<td style="padding: 12px 15px; color: #555; border-bottom: 1px solid #ddd;">${dataSheet.caseDimensions}</td>
</tr>
<tr>
<td style="padding: 12px 15px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">WATER RESISTANCE</td>
<td style="padding: 12px 15px; color: #555; border-bottom: 1px solid #ddd;">${dataSheet.waterResistance}</td>
</tr>
</tbody>
</table>
</div>
</div>
<div style="border: 2px solid #000; padding: 30px; text-align: center; background-color: #fff; margin-top: 40px;">
<h4 style="font-family: 'Playfair Display', serif; font-size: 20px; color: #000; margin-top: 0;">Acquisition Inquiry</h4>
<p style="font-size: 14px; color: #666; margin-bottom: 20px; max-width: 500px; margin-left: auto; margin-right: auto;">The ${dataSheet.factoryVersion} ${titleLine} is the definitive 1:1 luxury edition. Please verify stock availability with our luxury specialists prior to checkout.</p>
</div>
</div>`;
}

let enrichedCount = 0;
let preservedHtmlCount = 0;

for (const p of products) {
  const details = getModelDetails(p);

  // If product already has genuine rawDescriptionHtml from ZenRows:
  if (p.rawDescriptionHtml && p.rawDescriptionHtml.length > 200) {
    preservedHtmlCount++;
    // Fix any about:blank iframe if vimeo ID is present
    if (p.qcVideoVimeoId && p.rawDescriptionHtml.includes('about:blank')) {
      p.rawDescriptionHtml = p.rawDescriptionHtml.replace(
        /src="about:blank"/g,
        `src="https://player.vimeo.com/video/${p.qcVideoVimeoId}?autoplay=0&loop=1"`
      );
    }
    // Also attach structured dataSheet & richShowcase
    p.dataSheet = details.dataSheet;
    p.richShowcase = details;
  } else {
    // Generate 100% full detail HTML matching sample_page.html
    p.rawDescriptionHtml = generateRawHtml(p, details);
    p.dataSheet = details.dataSheet;
    p.richShowcase = details;
  }

  // Generate complete description text for CSV/Sheets
  p.description = `${details.titleLine}
${details.tagline}

${details.calibre.headline}
${details.calibre.summary}
• ${details.calibre.bullets[0].title}: ${details.calibre.bullets[0].desc}
• ${details.calibre.bullets[1].title}: ${details.calibre.bullets[1].desc}
• ${details.calibre.bullets[2].title}: ${details.calibre.bullets[2].desc}

TECHNICAL SPECIFICATIONS
• ${details.specs.bezel.label} - ${details.specs.bezel.title}: ${details.specs.bezel.desc}
• ${details.specs.crystal.label} - ${details.specs.crystal.title}: ${details.specs.crystal.desc}
• ${details.specs.caseProfile.label} - ${details.specs.caseProfile.title}: ${details.specs.caseProfile.desc}
• ${details.specs.bracelet.label} - ${details.specs.bracelet.title}: ${details.specs.bracelet.desc}

DATA SHEET
• Model Reference: ${details.dataSheet.modelReference}
• Factory / Version: ${details.dataSheet.factoryVersion}
• Movement: ${details.dataSheet.movement}
• Bezel: ${details.dataSheet.bezel}
• Case Material: ${details.dataSheet.caseMaterial}
• Bracelet: ${details.dataSheet.bracelet}
• Case Dimensions: ${details.dataSheet.caseDimensions}
• Water Resistance: ${details.dataSheet.waterResistance}`;

  enrichedCount++;
}

console.log(`Processed ${enrichedCount} products (Preserved raw ZenRows HTML: ${preservedHtmlCount}).`);

fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Updated all ${products.length} products in ${JSON_PATH}!`);

// Export to Clean, Compact CSV for Google Sheets
const headers = [
  'ID',
  'Brand',
  'Collection',
  'Product Name',
  'Model Reference',
  'Factory / Version',
  'Variant 1 Name',
  'Variant 1 Price (USD)',
  'Variant 2 Name',
  'Variant 2 Price (USD)',
  'Stock Status',
  'Movement',
  'Case Size',
  'Case Dimensions',
  'Case Material',
  'Bezel',
  'Bracelet',
  'Water Resistance',
  'Primary Image URL',
  'Summary Description',
  'Full Technical Details',
  'Status'
];

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  // Replace line breaks with bullet point delimiter so Google Sheets never blows up row heights!
  const str = String(val).replace(/"/g, '""').replace(/\r?\n+/g, ' • ');
  return `"${str}"`;
}

const csvRows = [headers.map(h => `"${h}"`).join(',')];

for (const p of products) {
  const ds = p.dataSheet || {};
  const sc = p.richShowcase || {};

  // Clean 1-line summary
  const summaryDesc = sc.tagline || `${p.name} - ${ds.factoryVersion || 'VSF/Clean 1:1'} with ${ds.movement || 'Swiss Movement'}.`;

  // Clean compact technical spec line
  const calibreBullets = sc.calibre?.bullets ? sc.calibre.bullets.map(b => `${b.title}: ${b.desc}`).join(' • ') : '';
  const fullTechDetails = `[CALIBRE] ${sc.calibre?.headline || ds.movement || ''}: ${calibreBullets} | [SPECS] Bezel: ${sc.specs?.bezel?.title || ds.bezel || ''} • Crystal: ${sc.specs?.crystal?.title || ''} • Case: ${sc.specs?.caseProfile?.title || ds.caseDimensions || ''} • Bracelet: ${sc.specs?.bracelet?.title || ds.bracelet || ''}`;

  const row = [
    escapeCsv(p.id),
    escapeCsv(p.brand),
    escapeCsv(p.collection),
    escapeCsv(p.name),
    escapeCsv(ds.modelReference || p.modelCode || p.spu || p.name),
    escapeCsv(ds.factoryVersion || p.factory || 'VSF / Clean 1:1'),
    escapeCsv(p.variant1Name || 'Swiss Movement'),
    escapeCsv(p.variant1Price || 700),
    escapeCsv(p.variant2Name || 'VS / Clean 1:1 Super Clone'),
    escapeCsv(p.variant2Price || 1199),
    escapeCsv(p.stock || 'IN_STOCK'),
    escapeCsv(p.movement || ds.movement || ''),
    escapeCsv(p.caseSize || ''),
    escapeCsv(ds.caseDimensions || ''),
    escapeCsv(p.material || ds.caseMaterial || ''),
    escapeCsv(ds.bezel || p.bezel || ''),
    escapeCsv(ds.bracelet || ''),
    escapeCsv(p.waterResistance || ds.waterResistance || ''),
    escapeCsv(p.primaryImage || ''),
    escapeCsv(summaryDesc),
    escapeCsv(fullTechDetails),
    escapeCsv(p.status || 'ACTIVE')
  ];
  csvRows.push(row.join(','));
}

const BOM = '\uFEFF';
fs.writeFileSync(CSV_PATH, BOM + csvRows.join('\r\n'), 'utf-8');
console.log(`Successfully generated updated Clean Compact CSV for Google Sheets: ${CSV_PATH}`);
