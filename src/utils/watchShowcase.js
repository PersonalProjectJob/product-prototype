/**
 * Helper to ensure every watch has the complete 2-part showcase:
 * 1. Description & Calibre Engine (matching user screenshot 1)
 * 2. Technical Specifications Grid (The Bezel, Crystal, Case Profile, Bracelet - matching user screenshot 2)
 */

export function getWatchShowcase(product) {
  if (product?.richShowcase && product.richShowcase.calibre && product.richShowcase.specs) {
    return product.richShowcase;
  }

  const brand = product?.brand || 'Rolex';
  const name = product?.name || 'Master Clone Watch';
  const lower = name.toLowerCase();
  const collection = product?.collection || 'Signature Series';
  const factory = (product?.factory || 'VSF / Clean Factory').split('/')[0].trim();

  // Extract reference number
  const refMatch = name.match(/m?\d{5,6}[a-zA-Z0-9-]*/i);
  const refCode = refMatch ? refMatch[0].toUpperCase() : (product?.modelCode || product?.spu || '1:1 Edition');

  // Nickname
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

  // Bracelet
  let braceletType = 'Oyster';
  let braceletTitle = 'Solid 904L Oyster Bracelet';
  let braceletDesc = 'Solid 904L Oystersteel 3-link bracelet with milled Glidelock extension clasp, offering 2mm incremental sizing adjustments.';

  if (lower.includes('jubilee')) {
    braceletType = 'Jubilee';
    braceletTitle = 'Jubilee Elegance';
    braceletDesc = 'The 5-link Jubilee bracelet offers superior comfort and a sophisticated look. VSF has refined the link articulation to ensure a silky-smooth drape on the wrist.';
  } else if (lower.includes('oysterflex') || lower.includes('rubber')) {
    braceletType = 'Oysterflex';
    braceletTitle = 'Oysterflex High-Performance Elastomer';
    braceletDesc = 'Flexible metal blade overmoulded with high-performance black elastomer and patented longitudinal cushions for supreme wrist stability.';
  } else if (lower.includes('leather')) {
    braceletType = 'Leather';
    braceletTitle = 'Hand-Stitched Alligator Leather';
    braceletDesc = 'Genuine Italian calf leather crafted with matte scales and deployant folding clasp with micro-adjustment.';
  }

  // Model-specific logic
  if (lower.includes('gmt') || collection.toLowerCase().includes('gmt')) {
    const bezelTitle = nickname.includes('Bruce Wayne')
      ? 'Black & Grey Cerachrom'
      : nickname.includes('Pepsi')
      ? 'Red & Blue Cerachrom'
      : nickname.includes('Batman')
      ? 'Blue & Black Cerachrom'
      : nickname.includes('Sprite')
      ? 'Green & Black Cerachrom'
      : 'Bi-Color Cerachrom Bezel';

    return {
      titleLine: `${brand} GMT-Master II ${nickname} ${refCode}: The ${factory} Ultimate ${braceletType} Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Stealth, Precision, Elegance. Featuring the market-leading Dandong DD3285 Movement, the flawless ${bezelTitle}, and the luxurious ${braceletType} Bracelet.`,
      calibre: {
        headline: 'POWERED BY DANDONG DD3285',
        summary: `Reliability is luxury. Unlike cheaper “modified” movements, this ${factory} ${nickname || 'GMT-Master II'} is powered by the custom-engineered Dandong 3285.`,
        bullets: [
          { title: '72-Hour Power Reserve', desc: 'A true weekend-proof watch.' },
          { title: 'True GMT Function', desc: 'Independent “Jumping Hour” hand for rapid time zone adjustment, exactly like the genuine Caliber 3285.' },
          { title: 'Correct Hand Stack', desc: 'The hour hand sits correctly relative to the GMT hand (ICHS), a critical detail for collectors.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: bezelTitle,
          desc: `The defining feature of the “${nickname ? nickname.replace(/[“”]/g, '') : 'GMT-Master II'}.” ${factory} has mastered the subtle transition between pitch black and sleek colors. The numerals are PVD platinum-coated for a sharp, enduring luster.`
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
      }
    };
  }

  if (lower.includes('daytona') || collection.toLowerCase().includes('daytona')) {
    return {
      titleLine: `${brand} Cosmograph Daytona ${nickname} ${refCode}: The ${factory} Dandong 4130 Super Clone Edition`.replace(/\s+/g, ' ').trim(),
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
          title: 'Cerachrom Tachymetric Scale',
          desc: 'High-density monobloc ceramic with laser-engraved tachymetric scale filled with platinum via PVD deposition for crisp readability.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Flush Scratch-Proof Sapphire',
          desc: 'Mounted perfectly flush with the bezel rim, featuring high-transmission anti-reflective undercoating and laser-etched crown at 6 o’clock.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '12.2mm Ultra-Slim',
          desc: 'Precision CNC-machined 904L Oystersteel case mirroring the exact curvature and wrist hug of the authentic Daytona.'
        },
        bracelet: {
          label: 'BRACELET',
          title: braceletTitle,
          desc: braceletDesc
        }
      }
    };
  }

  if (lower.includes('submariner') || lower.includes('sea-dweller') || collection.toLowerCase().includes('submariner')) {
    const bezelColor = nickname.includes('Hulk') ? 'Emerald Green Cerachrom' : nickname.includes('Starbucks') ? 'Lime Green Cerachrom' : nickname.includes('Smurf') ? 'Ocean Blue Cerachrom' : 'Jet Black Cerachrom';
    return {
      titleLine: `${brand} Submariner Date ${nickname} ${refCode}: The ${factory} Dandong 3235 Super Clone Edition`.replace(/\s+/g, ' ').trim(),
      tagline: `Deep-Sea Benchmark & Iconic Luxury. Equipped with Dandong VS3235 calibre, 120-click unidirectional Cerachrom bezel, and Glidelock clasp.`,
      calibre: {
        headline: 'POWERED BY DANDONG VS3235',
        summary: `Engineered without compromise. The Dandong 3235 represents the highest standard of timekeeping stability and component finishing.`,
        bullets: [
          { title: '70-Hour Extended Power Reserve', desc: 'Allows effortless wearing from Friday evening to Monday morning without stopping.' },
          { title: 'Instantaneous Midnight Date Jump', desc: 'Date wheel clicks decisively at 12:00:00 midnight with authentic centered font typography.' },
          { title: 'Chronergy Escapement & Parachrom Hairspring', desc: 'Precision balance architecture resistant to shocks and temperature variations.' }
        ]
      },
      specs: {
        bezel: {
          label: 'THE BEZEL',
          title: bezelColor,
          desc: '120-click unidirectional rotatable bezel with crisp audible feedback and zero backplay. Platinum-coated recessed graduations.'
        },
        crystal: {
          label: 'CRYSTAL',
          title: 'Cyclops 2.5x Lens with Blue AR',
          desc: 'Synthetic sapphire with signature Cyclops magnifying lens over the date, treated with multi-layer anti-reflective coating.'
        },
        caseProfile: {
          label: 'CASE PROFILE',
          title: '12.4mm Classic Diver',
          desc: 'Machined from solid corrosion-resistant 904L Oystersteel with brushed satin lugs and mirror-polished case flanks.'
        },
        bracelet: {
          label: 'BRACELET',
          title: 'Oyster with Glidelock Clasp',
          desc: 'Robust 3-piece solid link bracelet equipped with tool-free Glidelock extension system allowing 20mm adjustments in 2mm increments.'
        }
      }
    };
  }

  // Fallback for Patek, AP, Omega or Generic
  return {
    titleLine: `${brand} ${collection} ${refCode}: The ${factory} 1:1 Super Clone Edition`.replace(/\s+/g, ' ').trim(),
    tagline: `Precision, Prestige, Reliability. Featuring the custom Swiss Calibre, solid 904L steel case, and scratch-resistant sapphire crystal.`,
    calibre: {
      headline: `POWERED BY ${product?.movement?.toUpperCase() || 'CUSTOM SWISS CALIBRE'}`,
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
        title: product?.bezel || 'Precision Machined Bezel',
        desc: 'Crafted with scratch-resistant materials, laser-etched markers, and refined tactile feedback.'
      },
      crystal: {
        label: 'CRYSTAL',
        title: product?.crystal || 'Scratch-Proof Sapphire',
        desc: 'High-purity synthetic corundum sapphire crystal with optical-grade anti-reflective treatment.'
      },
      caseProfile: {
        label: 'CASE PROFILE',
        title: `${product?.caseSize || '40mm'} Proportion`,
        desc: 'Engineered from solid 904L Oystersteel with authentic weight balance and refined ergonomic curvature.'
      },
      bracelet: {
        label: 'BRACELET',
        title: braceletTitle,
        desc: braceletDesc
      }
    }
  };
}
