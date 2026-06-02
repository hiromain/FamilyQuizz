import degustation from './degustation.json';
import terroirsEtRegions from './terroirs_et_regions.json';
import sportsMecaniques from './sports_mecaniques.json';
import sciencesEtMedecine from './sciences_et_medecine.json';
import epoques from './epoques.json';
import histoire from './histoire.json';
import musique from './musique.json';
import cuisine from './cuisine.json';
import geographie from './geographie.json';
import sport from './sport.json';
import cinema from './cinema.json';
import artLitteratureMythologie from './art_litterature_mythologie.json';
import natureAnimaux from './nature_animaux.json';
import langueFrancaise from './langue_francaise.json';
import inventionsDecouvertes from './inventions_decouvertes.json';
import informatique from './informatique.json';

const questionsData = {
  ...degustation,
  ...terroirsEtRegions,
  ...sportsMecaniques,
  ...sciencesEtMedecine,
  ...epoques,
  ...histoire,
  ...musique,
  ...cuisine,
  ...geographie,
  ...sport,
  ...cinema,
  ...artLitteratureMythologie,
  ...natureAnimaux,
  ...langueFrancaise,
  ...inventionsDecouvertes,
  ...informatique
};

export default questionsData;
