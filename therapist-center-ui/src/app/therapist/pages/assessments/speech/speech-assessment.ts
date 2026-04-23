import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { TherapistService } from '../../../services/therapist.service';
import {
  ArticulationError,
  ArticulationLetter,
  AssessmentStatus,
  AssessmentType,
  DialogueItem,
  GrammarItem,
  ReceptiveExpressiveItem,
  SpeechAssessmentData,
  SpeechOrganItem,
  SpeechOrgansCheck,
  VocabularyItem,
  YesNoItem,
} from '../../../../core/models/assessment.model';
import { Student } from '../../../../core/models/student.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormDownloadButtonComponent } from '../shared/form-download-button';

// Order from the source PDF (28 sounds), with example words per position.
const ARABIC_LETTERS = [
  'ب','م','و','ف','ن','ل','ر','غ','ع','ح',
  'خ','ه','ا','د','ت','ط','ث','ظ','ذ','س',
  'ص','ز','ض','ج','ي','ش','ق','ك',
];

const LETTER_EXAMPLES: Record<string, { beginning: string; middle: string; end: string }> = {
  'ب': { beginning: 'برج',   middle: 'لبن',    end: 'عنب' },
  'م': { beginning: 'موز',   middle: 'سمك',    end: 'علم' },
  'و': { beginning: 'ورده',  middle: 'ثوم',    end: 'نونو' },
  'ف': { beginning: 'فول',   middle: 'صقر',    end: 'خروف' },
  'ن': { beginning: 'نمر',   middle: 'بنت',    end: 'عين' },
  'ل': { beginning: 'لبن',   middle: 'كلب',    end: 'فول' },
  'ر': { beginning: 'رمل',   middle: 'كره',    end: 'جزر' },
  'غ': { beginning: 'غراب',  middle: 'نغم',    end: 'دماغ' },
  'ع': { beginning: 'علم',   middle: 'شعر',    end: 'جامع' },
  'ح': { beginning: 'حلم',   middle: 'نحل',    end: 'بلح' },
  'خ': { beginning: 'خروف',  middle: 'نخلة',   end: 'مخ' },
  'ه': { beginning: 'هرم',   middle: 'ذهب',    end: 'ذرة' },
  'ا': { beginning: 'أسد',   middle: 'فأس',    end: 'قرأ' },
  'د': { beginning: 'دب',    middle: 'عدس',    end: 'يد' },
  'ت': { beginning: 'تمر',   middle: 'كتب',    end: 'بنت' },
  'ط': { beginning: 'طيارة', middle: 'بطة',    end: 'نط' },
  'ث': { beginning: 'ثعلب',  middle: 'هيثم',   end: 'حرث' },
  'ظ': { beginning: 'ظرف',   middle: 'محفظة',  end: 'حفظ' },
  'ذ': { beginning: 'ذرة',   middle: 'إذن',    end: 'تلميذ' },
  'س': { beginning: 'سلم',   middle: 'جسم',    end: 'كيس' },
  'ص': { beginning: 'صورة',  middle: 'بصل',    end: 'مقص' },
  'ز': { beginning: 'زيت',   middle: 'جزر',    end: 'خبز' },
  'ض': { beginning: 'ضوء',   middle: 'فضة',    end: 'بيض' },
  'ج': { beginning: 'جمل',   middle: 'نجمة',   end: 'برج' },
  'ي': { beginning: 'يويو',  middle: 'طيارة',  end: 'شاي' },
  'ش': { beginning: 'شجرة',  middle: 'مشط',    end: 'دش' },
  'ق': { beginning: 'قمر',   middle: 'بقرة',   end: 'طبق' },
  'ك': { beginning: 'كتاب',  middle: 'مركب',   end: 'ديك' },
};

// Source PDF has only 3 error categories (shown in dropdown).
const ERROR_OPTIONS: { value: ArticulationError; labelKey: string }[] = [
  { value: ArticulationError.None, labelKey: 'speech_err_none' },
  { value: ArticulationError.Substitution, labelKey: 'speech_err_substitution' },
  { value: ArticulationError.Omission, labelKey: 'speech_err_omission' },
  { value: ArticulationError.Distortion, labelKey: 'speech_err_distortion' },
];

// Inline translation map for NEW labels added in this update.
// Do NOT edit ar.ts/en.ts — other agents are editing them concurrently.
const T: Record<'ar' | 'en', Record<string, string>> = {
  ar: {
    sp_download_pdf: 'تحميل الاستمارة الأصلية (PDF)',
    sp_download_xlsx: 'تحميل جدول النطق (Excel)',

    // Organs sub-sections
    sp_org_group_lips: 'اولا: الشفاه',
    sp_org_group_tongue: 'ثانيا: اللسان',
    sp_org_group_teeth: 'ثالثا: الأسنان',
    sp_org_group_breathing_normal: 'رابعا: التمارين التنفسية العادية',
    sp_org_group_breathing_speech: 'خامسا: تمارين تنفسية نطقية',

    // Lips
    sp_org_lips_open_close: 'فتح وغلق الشفاه',
    sp_org_lips_round: 'ضم الشفاه بشكل دائرى',
    sp_org_lips_lr: 'تحريك الشفاه يمين ويسار',
    sp_org_lips_stretch: 'مط الشفاه',
    // Tongue
    sp_org_tongue_lr: 'تحريك اللسان يمين ويسار',
    sp_org_tongue_tie: 'ربط اللسان',
    sp_org_tongue_out: 'إخراج اللسان',
    sp_org_tongue_upper: 'لمس الأسنان العلوية',
    sp_org_tongue_lips: 'لمس الشفاه بشكل دائرى',
    // Teeth
    sp_org_teeth_match: 'تطابق الأسنان',
    sp_org_teeth_deform: 'تشوه الأسنان',
    // Breathing normal
    sp_org_br_paper: 'النفخ في قصاصات الورق',
    sp_org_br_balloon: 'النفخ في البالون',
    sp_org_br_soap: 'النفخ في فقاعات الصابون',
    sp_org_br_balls: 'النفخ في كرات بلاستيك',
    // Breathing speech
    sp_org_br_long: 'اصدار الصوت الطويل (ا-و-ى)',
    sp_org_br_short: 'الصوت القصير (أو-ى)',
    sp_org_br_arms: 'الصوت (أو-ى) مع حركة الذراعين',

    sp_col_check: 'الفحص',
    sp_col_yes: 'نعم',
    sp_col_no: 'لا',
    sp_col_notes: 'ملاحظات',
    sp_col_known: 'يعرف',
    sp_col_unknown: 'لا يعرف',

    // Vocabulary
    sp_section_vocabulary: 'المجموعات الضمنية',
    sp_col_word: 'الكلمة',
    sp_col_receptive: 'استقبالى',
    sp_col_expressive: 'تعبيرى',
    sp_vg_body: 'أجزاء الجسم',
    sp_vg_animals: 'الحيوانات',
    sp_vg_fruits: 'الفواكه',
    sp_vg_vegetables: 'الخضروات',
    sp_vg_furniture: 'الأثاث',
    sp_vg_professions: 'المهن',
    sp_vg_home: 'الأدوات المنزلية',
    sp_vg_colors: 'الألوان',
    sp_vg_clothes: 'الملابس',

    // Cognitive / pre-linguistic
    sp_section_cognitive: 'المهارات الإدراكية والأولية',
    sp_cog_eye: 'التواصل البصرى',
    sp_cog_attention: 'الانتباه والتركيز',
    sp_cog_beads: 'لضم الخرز',
    sp_cog_puzzle: 'تركيب بازل-مكعبات',
    sp_cog_match_colors: 'تطابق الألوان',
    sp_cog_match_shapes: 'تطابق الأشكال',
    sp_cog_match_objects: 'تطابق المجسمات',
    sp_cog_imitation: 'التقليد الحركى',
    sp_cog_hand_up: 'رفع اليد',
    sp_cog_jump: 'القفز',
    sp_cog_tap: 'النقر على الطاولة',
    sp_cog_clap: 'التصفيق',
    sp_cog_nose: 'لمس الأنف باليد',
    sp_cog_simple_cmd: 'تنفيذ الأوامر البسيطة',
    sp_cog_cmd_bring: 'هات',
    sp_cog_cmd_take: 'خذ',
    sp_cog_cmd_open: 'افتح',
    sp_cog_cmd_close: 'أغلق',
    sp_cog_complex_cmd: 'تنفيذ أوامر مركبة',
    sp_cog_cmd_spoon_plate: 'هات الملعقه والطبق',
    sp_cog_cmd_cup_water: 'هات الكوب واملأه بالماء',
    sp_cog_pointing: 'القدرة على التأشير',

    // Grammar
    sp_section_grammar: 'النحو والقواعد',
    sp_gr_negation: 'النفى',
    sp_gr_neg_1: 'الولد لا يأكل',
    sp_gr_neg_2: 'البنت لا تشرب',
    sp_gr_neg_3: 'الطفل لا يلعب',
    sp_gr_neg_4: 'الأم لا تطبخ',
    sp_gr_long: 'الجملة الطويلة',
    sp_gr_long_1: 'الولد يركب الدراجة',
    sp_gr_long_2: 'البنت تلعب بالعروسة',
    sp_gr_long_3: 'الطفل يأكل التفاحة',
    sp_gr_long_4: 'الأم تطبخ الطعام',
    sp_gr_long_5: 'الأب يقرأ الكتاب',
    sp_gr_long_6: 'الكلب ينبح',
    sp_gr_long_7: 'القطة تشرب الحليب',
    sp_gr_long_8: 'الطائر يطير',
    sp_gr_long_9: 'السمكة تسبح',
    sp_gr_long_10: 'الولد يغسل يديه',
    sp_gr_long_11: 'البنت ترتدى الفستان',
    sp_gr_long_12: 'الطفل يبكى',
    sp_gr_long_13: 'الجد يقرأ الجريدة',
    sp_gr_long_14: 'الجدة تخبز الكعك',
    sp_gr_long_15: 'الأخ يلعب الكرة',
    sp_gr_long_16: 'الأخت تدرس',
    sp_gr_long_17: 'السيارة تسير فى الشارع',
    sp_gr_long_18: 'المعلم يكتب على السبورة',
    sp_gr_long_19: 'الطبيب يعالج المريض',
    sp_gr_sp: 'المفرد والجمع',
    sp_gr_sp_1: 'ولد / أولاد',
    sp_gr_sp_2: 'بنت / بنات',
    sp_gr_sp_3: 'قلم / أقلام',
    sp_gr_sp_4: 'كتاب / كتب',
    sp_gr_sp_5: 'كرسى / كراسى',
    sp_gr_sp_6: 'تفاحة / تفاح',
    sp_gr_sp_7: 'قطة / قطط',
    sp_gr_sp_8: 'باب / أبواب',
    sp_gr_prep: 'الظروف',
    sp_gr_prep_1: 'فوق / تحت',
    sp_gr_prep_2: 'داخل / خارج',
    sp_gr_prep_3: 'أمام / خلف',
    sp_gr_prep_4: 'بجانب',
    sp_gr_pron: 'الضمائر',
    sp_gr_pron_1: 'أنا / أنت',
    sp_gr_pron_2: 'هو / هى',
    sp_gr_pron_3: 'قميصى / قميصك',
    sp_gr_tense: 'زمن الفعل',
    sp_gr_v_eats: 'ياكل موز (مضارع/ماضى/مستقبل)',
    sp_gr_v_plays: 'يلعب كوره (مضارع/ماضى/مستقبل)',
    sp_gr_v_puzzle: 'يركب بازل (مضارع/ماضى/مستقبل)',
    sp_gr_v_blows: 'ينفخ بالون (مضارع/ماضى/مستقبل)',
    sp_gr_state: 'الحال',

    // Dialogue
    sp_section_dialogue: 'الحوار',
    sp_col_question: 'السؤال',
    sp_col_response: 'الإجابة',
    sp_dlg_name: 'أسمك ايه؟',
    sp_dlg_age: 'كم عمرك؟',
    sp_dlg_school: 'اسم مدرستك؟',
    sp_dlg_siblings: 'كم أخ وأخت عندك؟',
    sp_dlg_parents: 'اسم أبوك وأمك؟',
    sp_dlg_fav_food: 'ما هو طعامك المفضل؟',
    sp_dlg_fav_color: 'ما هو لونك المفضل؟',
    sp_dlg_today: 'ماذا فعلت اليوم؟',

    // Perception (visual + auditory)
    sp_section_perception: 'الإدراك البصرى والسمعى',
    sp_pc_visual: 'الإدراك البصرى',
    sp_pc_auditory: 'الإدراك السمعى',
    sp_pc_eye_contact: 'نظرة العين',
    sp_pc_relationship: 'علاقة مع الأخصائية',
    sp_pc_door_knock: 'الانتباه للنقر على الباب',
    sp_pc_clap: 'التصفيق',
    sp_pc_light: 'الالتفات لمصدر ضوء',
    sp_pc_task: 'إنجاز المهمة',
    sp_pc_transfer: 'نقل الأشياء',
    sp_pc_cup_follow: 'متابعة الكوب',
    sp_pc_free_play: 'اللعب الحر',
    sp_pc_sound_source: 'الانتباه لمصدر الصوت',
    sp_pc_animals: 'الانتباه لأصوات الحيوانات',
    sp_pc_cat: 'قطة',
    sp_pc_duck: 'بطة',
    sp_pc_sheep: 'خروف',
    sp_pc_rooster: 'ديك',
    sp_pc_dog: 'كلب',
    sp_pc_high_low: 'صوت عالى/منخفض',
    sp_pc_long_short: 'طويل/قصير',
    sp_pc_quiet_noise: 'الهدوء/الضوضاء',
    sp_pc_man_woman: 'صوت الرجل/المرأة',

    sp_word_examples: 'أمثلة',
  },
  en: {
    sp_download_pdf: 'Download original form (PDF)',
    sp_download_xlsx: 'Download articulation sheet (Excel)',

    sp_org_group_lips: 'First: Lips',
    sp_org_group_tongue: 'Second: Tongue',
    sp_org_group_teeth: 'Third: Teeth',
    sp_org_group_breathing_normal: 'Fourth: Normal breathing exercises',
    sp_org_group_breathing_speech: 'Fifth: Speech breathing exercises',

    sp_org_lips_open_close: 'Open and close lips',
    sp_org_lips_round: 'Round lips',
    sp_org_lips_lr: 'Move lips left and right',
    sp_org_lips_stretch: 'Stretch lips',
    sp_org_tongue_lr: 'Move tongue left and right',
    sp_org_tongue_tie: 'Tongue tie',
    sp_org_tongue_out: 'Stick out tongue',
    sp_org_tongue_upper: 'Touch upper teeth',
    sp_org_tongue_lips: 'Touch lips in circles',
    sp_org_teeth_match: 'Teeth alignment',
    sp_org_teeth_deform: 'Teeth deformity',
    sp_org_br_paper: 'Blow paper strips',
    sp_org_br_balloon: 'Blow balloon',
    sp_org_br_soap: 'Blow soap bubbles',
    sp_org_br_balls: 'Blow plastic balls',
    sp_org_br_long: 'Long sound (a-u-i)',
    sp_org_br_short: 'Short sound (au-i)',
    sp_org_br_arms: 'Sound with arm motion',

    sp_col_check: 'Check',
    sp_col_yes: 'Yes',
    sp_col_no: 'No',
    sp_col_notes: 'Notes',
    sp_col_known: 'Knows',
    sp_col_unknown: 'Unknown',

    sp_section_vocabulary: 'Vocabulary groups',
    sp_col_word: 'Word',
    sp_col_receptive: 'Receptive',
    sp_col_expressive: 'Expressive',
    sp_vg_body: 'Body parts',
    sp_vg_animals: 'Animals',
    sp_vg_fruits: 'Fruits',
    sp_vg_vegetables: 'Vegetables',
    sp_vg_furniture: 'Furniture',
    sp_vg_professions: 'Professions',
    sp_vg_home: 'Home utensils',
    sp_vg_colors: 'Colors',
    sp_vg_clothes: 'Clothes',

    sp_section_cognitive: 'Cognitive & pre-linguistic skills',
    sp_cog_eye: 'Eye contact',
    sp_cog_attention: 'Attention and focus',
    sp_cog_beads: 'Threading beads',
    sp_cog_puzzle: 'Puzzles / cubes',
    sp_cog_match_colors: 'Match colors',
    sp_cog_match_shapes: 'Match shapes',
    sp_cog_match_objects: 'Match objects',
    sp_cog_imitation: 'Motor imitation',
    sp_cog_hand_up: 'Raise hand',
    sp_cog_jump: 'Jump',
    sp_cog_tap: 'Tap the table',
    sp_cog_clap: 'Clap',
    sp_cog_nose: 'Touch nose with hand',
    sp_cog_simple_cmd: 'Follow simple commands',
    sp_cog_cmd_bring: 'Bring',
    sp_cog_cmd_take: 'Take',
    sp_cog_cmd_open: 'Open',
    sp_cog_cmd_close: 'Close',
    sp_cog_complex_cmd: 'Follow complex commands',
    sp_cog_cmd_spoon_plate: 'Bring the spoon and plate',
    sp_cog_cmd_cup_water: 'Bring the cup and fill it with water',
    sp_cog_pointing: 'Ability to point',

    sp_section_grammar: 'Grammar',
    sp_gr_negation: 'Negation',
    sp_gr_neg_1: 'The boy does not eat',
    sp_gr_neg_2: 'The girl does not drink',
    sp_gr_neg_3: 'The child does not play',
    sp_gr_neg_4: 'The mother does not cook',
    sp_gr_long: 'Long sentence',
    sp_gr_long_1: 'The boy rides the bike',
    sp_gr_long_2: 'The girl plays with the doll',
    sp_gr_long_3: 'The child eats the apple',
    sp_gr_long_4: 'The mother cooks food',
    sp_gr_long_5: 'The father reads the book',
    sp_gr_long_6: 'The dog barks',
    sp_gr_long_7: 'The cat drinks milk',
    sp_gr_long_8: 'The bird flies',
    sp_gr_long_9: 'The fish swims',
    sp_gr_long_10: 'The boy washes his hands',
    sp_gr_long_11: 'The girl wears the dress',
    sp_gr_long_12: 'The child cries',
    sp_gr_long_13: 'Grandpa reads the newspaper',
    sp_gr_long_14: 'Grandma bakes cakes',
    sp_gr_long_15: 'The brother plays ball',
    sp_gr_long_16: 'The sister studies',
    sp_gr_long_17: 'The car drives in the street',
    sp_gr_long_18: 'The teacher writes on the board',
    sp_gr_long_19: 'The doctor treats the patient',
    sp_gr_sp: 'Singular & plural',
    sp_gr_sp_1: 'Boy / boys',
    sp_gr_sp_2: 'Girl / girls',
    sp_gr_sp_3: 'Pen / pens',
    sp_gr_sp_4: 'Book / books',
    sp_gr_sp_5: 'Chair / chairs',
    sp_gr_sp_6: 'Apple / apples',
    sp_gr_sp_7: 'Cat / cats',
    sp_gr_sp_8: 'Door / doors',
    sp_gr_prep: 'Prepositions',
    sp_gr_prep_1: 'Above / below',
    sp_gr_prep_2: 'Inside / outside',
    sp_gr_prep_3: 'Front / behind',
    sp_gr_prep_4: 'Beside',
    sp_gr_pron: 'Pronouns',
    sp_gr_pron_1: 'I / you',
    sp_gr_pron_2: 'He / she',
    sp_gr_pron_3: 'My shirt / your shirt',
    sp_gr_tense: 'Verb tense',
    sp_gr_v_eats: 'Eats banana (present/past/future)',
    sp_gr_v_plays: 'Plays ball (present/past/future)',
    sp_gr_v_puzzle: 'Builds puzzle (present/past/future)',
    sp_gr_v_blows: 'Blows balloon (present/past/future)',
    sp_gr_state: 'State / adverb',

    sp_section_dialogue: 'Dialogue',
    sp_col_question: 'Question',
    sp_col_response: 'Response',
    sp_dlg_name: 'What is your name?',
    sp_dlg_age: 'How old are you?',
    sp_dlg_school: 'What is your school?',
    sp_dlg_siblings: 'How many siblings do you have?',
    sp_dlg_parents: 'What are your parents\' names?',
    sp_dlg_fav_food: 'What is your favorite food?',
    sp_dlg_fav_color: 'What is your favorite color?',
    sp_dlg_today: 'What did you do today?',

    sp_section_perception: 'Visual & auditory perception',
    sp_pc_visual: 'Visual perception',
    sp_pc_auditory: 'Auditory perception',
    sp_pc_eye_contact: 'Eye contact',
    sp_pc_relationship: 'Rapport with therapist',
    sp_pc_door_knock: 'Attending to door knock',
    sp_pc_clap: 'Clapping',
    sp_pc_light: 'Orienting to light source',
    sp_pc_task: 'Task completion',
    sp_pc_transfer: 'Transferring objects',
    sp_pc_cup_follow: 'Following the cup',
    sp_pc_free_play: 'Free play',
    sp_pc_sound_source: 'Attending to sound source',
    sp_pc_animals: 'Attending to animal sounds',
    sp_pc_cat: 'Cat',
    sp_pc_duck: 'Duck',
    sp_pc_sheep: 'Sheep',
    sp_pc_rooster: 'Rooster',
    sp_pc_dog: 'Dog',
    sp_pc_high_low: 'High/low sound',
    sp_pc_long_short: 'Long/short',
    sp_pc_quiet_noise: 'Quiet/noise',
    sp_pc_man_woman: 'Man/woman voice',

    sp_word_examples: 'Examples',
  },
};

// ---------------- Data definitions ----------------

const ORGAN_DEF: { group: string; key: string; label: string }[] = [
  { group: 'sp_org_group_lips',             key: 'lips_open_close',    label: 'sp_org_lips_open_close' },
  { group: 'sp_org_group_lips',             key: 'lips_round',         label: 'sp_org_lips_round' },
  { group: 'sp_org_group_lips',             key: 'lips_lr',            label: 'sp_org_lips_lr' },
  { group: 'sp_org_group_lips',             key: 'lips_stretch',       label: 'sp_org_lips_stretch' },
  { group: 'sp_org_group_tongue',           key: 'tongue_lr',          label: 'sp_org_tongue_lr' },
  { group: 'sp_org_group_tongue',           key: 'tongue_tie',         label: 'sp_org_tongue_tie' },
  { group: 'sp_org_group_tongue',           key: 'tongue_out',         label: 'sp_org_tongue_out' },
  { group: 'sp_org_group_tongue',           key: 'tongue_upper',       label: 'sp_org_tongue_upper' },
  { group: 'sp_org_group_tongue',           key: 'tongue_lips',        label: 'sp_org_tongue_lips' },
  { group: 'sp_org_group_teeth',            key: 'teeth_match',        label: 'sp_org_teeth_match' },
  { group: 'sp_org_group_teeth',            key: 'teeth_deform',       label: 'sp_org_teeth_deform' },
  { group: 'sp_org_group_breathing_normal', key: 'br_paper',           label: 'sp_org_br_paper' },
  { group: 'sp_org_group_breathing_normal', key: 'br_balloon',         label: 'sp_org_br_balloon' },
  { group: 'sp_org_group_breathing_normal', key: 'br_soap',            label: 'sp_org_br_soap' },
  { group: 'sp_org_group_breathing_normal', key: 'br_balls',           label: 'sp_org_br_balls' },
  { group: 'sp_org_group_breathing_speech', key: 'br_long',            label: 'sp_org_br_long' },
  { group: 'sp_org_group_breathing_speech', key: 'br_short',           label: 'sp_org_br_short' },
  { group: 'sp_org_group_breathing_speech', key: 'br_arms',            label: 'sp_org_br_arms' },
];

const VOCAB_DEF: { group: string; words: string[] }[] = [
  { group: 'sp_vg_body',        words: ['عين','أنف','أذن','فم','يد','شفاه','أسنان'] },
  { group: 'sp_vg_animals',     words: ['كلب','قطه','بقرة','حصان','خروف','زرافه','نمر','أسد','فيل','قرد'] },
  { group: 'sp_vg_fruits',      words: ['تفاح','موز','برتقال','مانجو','بطيخ','كيوى','أناناس','خوخ','رمان','فراوله','جوافه'] },
  { group: 'sp_vg_vegetables',  words: ['طماطم','خيار','بطاطس','باذنجان','فلفل','جزر','بصل','خس','ثوم','ليمون'] },
  { group: 'sp_vg_furniture',   words: ['باب','طاوله','كرسى','سرير','دولاب','شباك'] },
  { group: 'sp_vg_professions', words: ['طبيب','معلم','جزار','ظابط','حلاق'] },
  { group: 'sp_vg_home',        words: ['شوكه','طبق','ملعقه','كوب','قدر','سكين'] },
  { group: 'sp_vg_colors',      words: ['أحمر','أسود','أبيض','أخضر','أزرق','برتقالى'] },
  { group: 'sp_vg_clothes',     words: ['فستان','بلوزه','قميص','حذاء','شراب','بنطلون'] },
];

const COGNITIVE_DEF: { group: string; key: string; label: string }[] = [
  { group: 'sp_cog_eye',           key: 'eye',              label: 'sp_cog_eye' },
  { group: 'sp_cog_attention',     key: 'att_beads',        label: 'sp_cog_beads' },
  { group: 'sp_cog_attention',     key: 'att_puzzle',       label: 'sp_cog_puzzle' },
  { group: 'sp_cog_attention',     key: 'att_match_colors', label: 'sp_cog_match_colors' },
  { group: 'sp_cog_attention',     key: 'att_match_shapes', label: 'sp_cog_match_shapes' },
  { group: 'sp_cog_attention',     key: 'att_match_obj',    label: 'sp_cog_match_objects' },
  { group: 'sp_cog_imitation',     key: 'im_hand',          label: 'sp_cog_hand_up' },
  { group: 'sp_cog_imitation',     key: 'im_jump',          label: 'sp_cog_jump' },
  { group: 'sp_cog_imitation',     key: 'im_tap',           label: 'sp_cog_tap' },
  { group: 'sp_cog_imitation',     key: 'im_clap',          label: 'sp_cog_clap' },
  { group: 'sp_cog_imitation',     key: 'im_nose',          label: 'sp_cog_nose' },
  { group: 'sp_cog_simple_cmd',    key: 'cmd_bring',        label: 'sp_cog_cmd_bring' },
  { group: 'sp_cog_simple_cmd',    key: 'cmd_take',         label: 'sp_cog_cmd_take' },
  { group: 'sp_cog_simple_cmd',    key: 'cmd_open',         label: 'sp_cog_cmd_open' },
  { group: 'sp_cog_simple_cmd',    key: 'cmd_close',        label: 'sp_cog_cmd_close' },
  { group: 'sp_cog_complex_cmd',   key: 'cmd_sp',           label: 'sp_cog_cmd_spoon_plate' },
  { group: 'sp_cog_complex_cmd',   key: 'cmd_cup',          label: 'sp_cog_cmd_cup_water' },
  { group: 'sp_cog_pointing',      key: 'pointing',         label: 'sp_cog_pointing' },
];

const GRAMMAR_DEF: { group: string; key: string; label: string }[] = [
  { group: 'sp_gr_negation', key: 'neg_1',   label: 'sp_gr_neg_1' },
  { group: 'sp_gr_negation', key: 'neg_2',   label: 'sp_gr_neg_2' },
  { group: 'sp_gr_negation', key: 'neg_3',   label: 'sp_gr_neg_3' },
  { group: 'sp_gr_negation', key: 'neg_4',   label: 'sp_gr_neg_4' },
  { group: 'sp_gr_long',     key: 'long_1',  label: 'sp_gr_long_1' },
  { group: 'sp_gr_long',     key: 'long_2',  label: 'sp_gr_long_2' },
  { group: 'sp_gr_long',     key: 'long_3',  label: 'sp_gr_long_3' },
  { group: 'sp_gr_long',     key: 'long_4',  label: 'sp_gr_long_4' },
  { group: 'sp_gr_long',     key: 'long_5',  label: 'sp_gr_long_5' },
  { group: 'sp_gr_long',     key: 'long_6',  label: 'sp_gr_long_6' },
  { group: 'sp_gr_long',     key: 'long_7',  label: 'sp_gr_long_7' },
  { group: 'sp_gr_long',     key: 'long_8',  label: 'sp_gr_long_8' },
  { group: 'sp_gr_long',     key: 'long_9',  label: 'sp_gr_long_9' },
  { group: 'sp_gr_long',     key: 'long_10', label: 'sp_gr_long_10' },
  { group: 'sp_gr_long',     key: 'long_11', label: 'sp_gr_long_11' },
  { group: 'sp_gr_long',     key: 'long_12', label: 'sp_gr_long_12' },
  { group: 'sp_gr_long',     key: 'long_13', label: 'sp_gr_long_13' },
  { group: 'sp_gr_long',     key: 'long_14', label: 'sp_gr_long_14' },
  { group: 'sp_gr_long',     key: 'long_15', label: 'sp_gr_long_15' },
  { group: 'sp_gr_long',     key: 'long_16', label: 'sp_gr_long_16' },
  { group: 'sp_gr_long',     key: 'long_17', label: 'sp_gr_long_17' },
  { group: 'sp_gr_long',     key: 'long_18', label: 'sp_gr_long_18' },
  { group: 'sp_gr_long',     key: 'long_19', label: 'sp_gr_long_19' },
  { group: 'sp_gr_sp',       key: 'sp_1',    label: 'sp_gr_sp_1' },
  { group: 'sp_gr_sp',       key: 'sp_2',    label: 'sp_gr_sp_2' },
  { group: 'sp_gr_sp',       key: 'sp_3',    label: 'sp_gr_sp_3' },
  { group: 'sp_gr_sp',       key: 'sp_4',    label: 'sp_gr_sp_4' },
  { group: 'sp_gr_sp',       key: 'sp_5',    label: 'sp_gr_sp_5' },
  { group: 'sp_gr_sp',       key: 'sp_6',    label: 'sp_gr_sp_6' },
  { group: 'sp_gr_sp',       key: 'sp_7',    label: 'sp_gr_sp_7' },
  { group: 'sp_gr_sp',       key: 'sp_8',    label: 'sp_gr_sp_8' },
  { group: 'sp_gr_prep',     key: 'prep_1',  label: 'sp_gr_prep_1' },
  { group: 'sp_gr_prep',     key: 'prep_2',  label: 'sp_gr_prep_2' },
  { group: 'sp_gr_prep',     key: 'prep_3',  label: 'sp_gr_prep_3' },
  { group: 'sp_gr_prep',     key: 'prep_4',  label: 'sp_gr_prep_4' },
  { group: 'sp_gr_pron',     key: 'pron_1',  label: 'sp_gr_pron_1' },
  { group: 'sp_gr_pron',     key: 'pron_2',  label: 'sp_gr_pron_2' },
  { group: 'sp_gr_pron',     key: 'pron_3',  label: 'sp_gr_pron_3' },
  { group: 'sp_gr_tense',    key: 't_eats',  label: 'sp_gr_v_eats' },
  { group: 'sp_gr_tense',    key: 't_plays', label: 'sp_gr_v_plays' },
  { group: 'sp_gr_tense',    key: 't_puzzle',label: 'sp_gr_v_puzzle' },
  { group: 'sp_gr_tense',    key: 't_blows', label: 'sp_gr_v_blows' },
  { group: 'sp_gr_state',    key: 'state',   label: 'sp_gr_state' },
];

const DIALOGUE_DEF: string[] = [
  'sp_dlg_name',
  'sp_dlg_age',
  'sp_dlg_school',
  'sp_dlg_siblings',
  'sp_dlg_parents',
  'sp_dlg_fav_food',
  'sp_dlg_fav_color',
  'sp_dlg_today',
];

const PERCEPTION_DEF: { group: string; key: string; label: string }[] = [
  { group: 'sp_pc_visual',   key: 'eye_contact',   label: 'sp_pc_eye_contact' },
  { group: 'sp_pc_visual',   key: 'relationship',  label: 'sp_pc_relationship' },
  { group: 'sp_pc_visual',   key: 'door_knock',    label: 'sp_pc_door_knock' },
  { group: 'sp_pc_visual',   key: 'clap',          label: 'sp_pc_clap' },
  { group: 'sp_pc_visual',   key: 'light',         label: 'sp_pc_light' },
  { group: 'sp_pc_visual',   key: 'task',          label: 'sp_pc_task' },
  { group: 'sp_pc_visual',   key: 'transfer',      label: 'sp_pc_transfer' },
  { group: 'sp_pc_visual',   key: 'cup_follow',    label: 'sp_pc_cup_follow' },
  { group: 'sp_pc_visual',   key: 'free_play',     label: 'sp_pc_free_play' },
  { group: 'sp_pc_auditory', key: 'sound_source',  label: 'sp_pc_sound_source' },
  { group: 'sp_pc_auditory', key: 'anim_cat',      label: 'sp_pc_cat' },
  { group: 'sp_pc_auditory', key: 'anim_duck',     label: 'sp_pc_duck' },
  { group: 'sp_pc_auditory', key: 'anim_sheep',    label: 'sp_pc_sheep' },
  { group: 'sp_pc_auditory', key: 'anim_rooster',  label: 'sp_pc_rooster' },
  { group: 'sp_pc_auditory', key: 'anim_dog',      label: 'sp_pc_dog' },
  { group: 'sp_pc_auditory', key: 'high_low',      label: 'sp_pc_high_low' },
  { group: 'sp_pc_auditory', key: 'long_short',    label: 'sp_pc_long_short' },
  { group: 'sp_pc_auditory', key: 'quiet_noise',   label: 'sp_pc_quiet_noise' },
  { group: 'sp_pc_auditory', key: 'man_woman',     label: 'sp_pc_man_woman' },
];

@Component({
  selector: 'app-speech-assessment',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, FormDownloadButtonComponent],
  template: `
    <div class="assess-wrapper">
      <a routerLink="/therapist/assessments" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {{ 'assess_back_to_hub' | translate }}
      </a>

      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
        <app-form-download-button fileName="speech-articulation-evaluation.pdf" [label]="t('sp_download_pdf')" format="pdf" />
        <app-form-download-button fileName="speech-articulation-evaluation.xlsx" [label]="t('sp_download_xlsx')" format="xlsx" />
      </div>

      <header class="assess-header">
        <div class="header-title">
          <div class="title-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>
          </div>
          <div>
            <h1>{{ 'assess_type_speech' | translate }}</h1>
            <p>{{ 'assess_speech_full_desc' | translate }}</p>
          </div>
        </div>

        <div class="header-actions">
          <button type="button" class="btn btn-outline" [disabled]="saving()" (click)="save(true)">
            {{ 'assess_save_draft' | translate }}
          </button>
          <button type="button" class="btn btn-primary" [disabled]="saving() || !canSubmit()" (click)="save(false)">
            {{ saving() ? ('assess_saving' | translate) : ('assess_submit' | translate) }}
          </button>
        </div>
      </header>

      @if (savedNotice()) {
        <div class="notice success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {{ savedNotice() }}
        </div>
      }

      <!-- Header form: student + date -->
      <section class="card">
        <div class="card-body grid-2">
          <div class="form-group">
            <label for="student">{{ 'assess_pick_student' | translate }} *</label>
            @if (loadingStudents()) {
              <div class="input-skeleton"></div>
            } @else {
              <select id="student" [(ngModel)]="studentId" name="studentId" [class.invalid]="submitted() && !studentId()">
                <option [ngValue]="''">{{ 'select_student' | translate }}…</option>
                @for (s of students(); track s.id) {
                  <option [ngValue]="s.id">{{ s.fullName }}</option>
                }
              </select>
            }
          </div>
          <div class="form-group">
            <label for="date">{{ 'assess_date' | translate }} *</label>
            <input id="date" type="date" [(ngModel)]="evalDate" name="evalDate" />
          </div>
        </div>
      </section>

      <!-- Section 1: Articulation -->
      <section class="card">
        <header class="section-head">
          <h2>1. {{ 'speech_section_articulation' | translate }}</h2>
          <span class="section-hint">{{ 'speech_articulation_hint' | translate }}</span>
        </header>
        <div class="table-wrap">
          <table class="data-table articulation-table">
            <thead>
              <tr>
                <th class="letter-col">{{ 'speech_letter' | translate }}</th>
                <th>{{ 'speech_pos_beginning' | translate }}</th>
                <th>{{ 'speech_pos_middle' | translate }}</th>
                <th>{{ 'speech_pos_end' | translate }}</th>
                <th>{{ 'assess_notes' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of articulation(); track row.letter; let i = $index) {
                <tr [class.has-error]="rowHasError(row)">
                  <td class="letter-cell">{{ row.letter }}</td>
                  <td>
                    <select [(ngModel)]="row.beginning" [name]="'beg-' + i" [class.err]="row.beginning !== 'None'">
                      @for (opt of errorOptions; track opt.value) {
                        <option [ngValue]="opt.value">{{ opt.labelKey | translate }}</option>
                      }
                    </select>
                    <div class="example">{{ example(row.letter, 'beginning') }}</div>
                  </td>
                  <td>
                    <select [(ngModel)]="row.middle" [name]="'mid-' + i" [class.err]="row.middle !== 'None'">
                      @for (opt of errorOptions; track opt.value) {
                        <option [ngValue]="opt.value">{{ opt.labelKey | translate }}</option>
                      }
                    </select>
                    <div class="example">{{ example(row.letter, 'middle') }}</div>
                  </td>
                  <td>
                    <select [(ngModel)]="row.end" [name]="'end-' + i" [class.err]="row.end !== 'None'">
                      @for (opt of errorOptions; track opt.value) {
                        <option [ngValue]="opt.value">{{ opt.labelKey | translate }}</option>
                      }
                    </select>
                    <div class="example">{{ example(row.letter, 'end') }}</div>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="row.notes" [name]="'note-' + i" [placeholder]="('assess_optional' | translate)" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="counter-bar">
          <span class="counter-pill">{{ 'speech_total_errors' | translate }}: <strong>{{ totalErrors() }}</strong></span>
          <span class="counter-pill ok">{{ 'speech_clean_letters' | translate }}: <strong>{{ cleanLetters() }}</strong></span>
        </div>
      </section>

      <!-- Section 2: Speech organs (structured) -->
      <section class="card">
        <header class="section-head">
          <h2>2. {{ 'speech_section_organs' | translate }}</h2>
          <span class="section-hint">{{ 'speech_organs_hint' | translate }}</span>
        </header>
        <div class="table-wrap">
          <table class="data-table grouped-table">
            <thead>
              <tr>
                <th>{{ t('sp_col_check') }}</th>
                <th class="yesno-col">{{ t('sp_col_yes') }}</th>
                <th class="yesno-col">{{ t('sp_col_no') }}</th>
                <th>{{ t('sp_col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (grp of organGroups(); track grp) {
                <tr class="group-row"><td colspan="4">{{ t(grp) }}</td></tr>
                @for (row of organsByGroup(grp); track row.key; let i = $index) {
                  <tr>
                    <td class="check-cell">{{ t(row.label) }}</td>
                    <td class="center">
                      <input type="radio" class="big-check" [name]="'orgn-' + row.key" [value]="true" [(ngModel)]="row.normal" />
                    </td>
                    <td class="center">
                      <input type="radio" class="big-check" [name]="'orgn-' + row.key" [value]="false" [(ngModel)]="row.normal" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="row.notes" [name]="'orgn-notes-' + row.key" [placeholder]="('assess_optional' | translate)" />
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 3: Vocabulary (receptive/expressive per word) -->
      <section class="card">
        <header class="section-head">
          <h2>3. {{ t('sp_section_vocabulary') }}</h2>
        </header>
        <div class="table-wrap">
          <table class="data-table grouped-table">
            <thead>
              <tr>
                <th>{{ t('sp_col_word') }}</th>
                <th class="yesno-col">{{ t('sp_col_receptive') }}</th>
                <th class="yesno-col">{{ t('sp_col_expressive') }}</th>
                <th>{{ t('sp_col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (grp of vocabGroups(); track grp) {
                <tr class="group-row"><td colspan="4">{{ t(grp) }}</td></tr>
                @for (row of vocabByGroup(grp); track row.word; let i = $index) {
                  <tr>
                    <td class="check-cell">{{ row.word }}</td>
                    <td class="center">
                      <input type="checkbox" class="big-check" [(ngModel)]="row.receptive" [name]="'v-rec-' + grp + '-' + i" />
                    </td>
                    <td class="center">
                      <input type="checkbox" class="big-check" [(ngModel)]="row.expressive" [name]="'v-exp-' + grp + '-' + i" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="row.notes" [name]="'v-notes-' + grp + '-' + i" [placeholder]="('assess_optional' | translate)" />
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 4: Cognitive / pre-linguistic (collapsible) -->
      <details class="accordion">
        <summary>
          <h2>4. {{ t('sp_section_cognitive') }}</h2>
        </summary>
        <div class="table-wrap">
          <table class="data-table grouped-table">
            <thead>
              <tr>
                <th>{{ t('sp_col_check') }}</th>
                <th class="yesno-col">{{ t('sp_col_known') }}</th>
                <th class="yesno-col">{{ t('sp_col_unknown') }}</th>
                <th>{{ t('sp_col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (grp of cognitiveGroups(); track grp) {
                <tr class="group-row"><td colspan="4">{{ t(grp) }}</td></tr>
                @for (row of cognitiveByGroup(grp); track row.key) {
                  <tr>
                    <td class="check-cell">{{ t(row.label) }}</td>
                    <td class="center">
                      <input type="radio" class="big-check" [name]="'cog-' + row.key" [value]="true" [(ngModel)]="row.known" />
                    </td>
                    <td class="center">
                      <input type="radio" class="big-check" [name]="'cog-' + row.key" [value]="false" [(ngModel)]="row.known" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="row.notes" [name]="'cog-notes-' + row.key" [placeholder]="('assess_optional' | translate)" />
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Section 5: Grammar (collapsible) -->
      <details class="accordion">
        <summary>
          <h2>5. {{ t('sp_section_grammar') }}</h2>
        </summary>
        <div class="table-wrap">
          <table class="data-table grouped-table">
            <thead>
              <tr>
                <th>{{ t('sp_col_check') }}</th>
                <th class="yesno-col">{{ t('sp_col_receptive') }}</th>
                <th class="yesno-col">{{ t('sp_col_expressive') }}</th>
                <th>{{ t('sp_col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (grp of grammarGroups(); track grp) {
                <tr class="group-row"><td colspan="4">{{ t(grp) }}</td></tr>
                @for (row of grammarByGroup(grp); track row.key) {
                  <tr>
                    <td class="check-cell">{{ t(row.label) }}</td>
                    <td class="center">
                      <input type="checkbox" class="big-check" [(ngModel)]="row.receptive" [name]="'gr-rec-' + row.key" />
                    </td>
                    <td class="center">
                      <input type="checkbox" class="big-check" [(ngModel)]="row.expressive" [name]="'gr-exp-' + row.key" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="row.notes" [name]="'gr-notes-' + row.key" [placeholder]="('assess_optional' | translate)" />
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Section 6: Dialogue (collapsible) -->
      <details class="accordion">
        <summary>
          <h2>6. {{ t('sp_section_dialogue') }}</h2>
        </summary>
        <div class="table-wrap">
          <table class="data-table grouped-table">
            <thead>
              <tr>
                <th>{{ t('sp_col_question') }}</th>
                <th>{{ t('sp_col_response') }}</th>
                <th>{{ t('sp_col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of dialogue(); track row.question; let i = $index) {
                <tr>
                  <td class="check-cell">{{ t(row.question) }}</td>
                  <td>
                    <input type="text" [(ngModel)]="row.response" [name]="'dlg-resp-' + i" [placeholder]="('assess_optional' | translate)" />
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="row.notes" [name]="'dlg-notes-' + i" [placeholder]="('assess_optional' | translate)" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Section 7: Perception (collapsible) -->
      <details class="accordion">
        <summary>
          <h2>7. {{ t('sp_section_perception') }}</h2>
        </summary>
        <div class="table-wrap">
          <table class="data-table grouped-table">
            <thead>
              <tr>
                <th>{{ t('sp_col_check') }}</th>
                <th class="yesno-col">{{ t('sp_col_known') }}</th>
                <th class="yesno-col">{{ t('sp_col_unknown') }}</th>
                <th>{{ t('sp_col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (grp of perceptionGroups(); track grp) {
                <tr class="group-row"><td colspan="4">{{ t(grp) }}</td></tr>
                @for (row of perceptionByGroup(grp); track row.key) {
                  <tr>
                    <td class="check-cell">{{ t(row.label) }}</td>
                    <td class="center">
                      <input type="radio" class="big-check" [name]="'pc-' + row.key" [value]="true" [(ngModel)]="row.known" />
                    </td>
                    <td class="center">
                      <input type="radio" class="big-check" [name]="'pc-' + row.key" [value]="false" [(ngModel)]="row.known" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="row.notes" [name]="'pc-notes-' + row.key" [placeholder]="('assess_optional' | translate)" />
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Section 8: Notes & recommendations -->
      <section class="card">
        <header class="section-head">
          <h2>8. {{ 'assess_notes_recommendations' | translate }}</h2>
        </header>
        <div class="card-body grid-2">
          <div class="form-group">
            <label for="general">{{ 'assess_general_notes' | translate }}</label>
            <textarea id="general" [(ngModel)]="generalNotes" name="general" rows="5" [placeholder]="('assess_general_notes_ph' | translate)"></textarea>
          </div>
          <div class="form-group">
            <label for="recs">{{ 'assess_recommendations' | translate }}</label>
            <textarea id="recs" [(ngModel)]="recommendations" name="recs" rows="5" [placeholder]="('assess_recommendations_ph' | translate)"></textarea>
          </div>
        </div>
      </section>

      <footer class="footer-actions">
        <button type="button" class="btn btn-outline" [disabled]="saving()" (click)="save(true)">
          {{ 'assess_save_draft' | translate }}
        </button>
        <button type="button" class="btn btn-primary" [disabled]="saving() || !canSubmit()" (click)="save(false)">
          {{ saving() ? ('assess_saving' | translate) : ('assess_submit' | translate) }}
        </button>
      </footer>
    </div>
  `,
  styles: `
    :host { display: block; --accent: #5C7A65; }

    .assess-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    .back-link {
      display: inline-flex; align-items: center; gap: 0.4rem;
      color: var(--text-muted); font-size: 0.9rem; font-weight: 600;
      text-decoration: none; align-self: flex-start;
    }
    .back-link:hover { color: var(--primary); }
    .back-link svg { width: 16px; height: 16px; }
    [dir="rtl"] .back-link svg { transform: scaleX(-1); }

    .assess-header {
      display: flex; justify-content: space-between; align-items: center;
      gap: 1.5rem; flex-wrap: wrap;
      background: var(--white); border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg); padding: 1.25rem 1.5rem;
    }
    .header-title { display: flex; gap: 1rem; align-items: center; }
    .title-icon {
      width: 56px; height: 56px; border-radius: 14px;
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .title-icon svg { width: 28px; height: 28px; }
    .header-title h1 { margin: 0 0 0.2rem; font-size: 1.35rem; color: var(--heading-color); }
    .header-title p { margin: 0; font-size: 0.85rem; color: var(--text-muted); max-width: 580px; }

    .header-actions { display: flex; gap: 0.6rem; }

    .btn {
      padding: 0.6rem 1.25rem; border-radius: var(--radius-sm);
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      border: 1.5px solid transparent; transition: var(--transition);
    }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-primary { background: var(--accent); color: var(--white); border-color: var(--accent); }
    .btn-primary:hover:not(:disabled) { filter: brightness(0.92); }
    .btn-outline { background: transparent; color: var(--text); border-color: var(--border-light); }
    .btn-outline:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }

    .notice {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.85rem 1.1rem; border-radius: var(--radius-md);
      font-size: 0.9rem; font-weight: 600;
    }
    .notice.success { background: color-mix(in srgb, var(--accent) 10%, transparent); color: var(--accent); }
    .notice svg { width: 20px; height: 20px; }

    .card {
      background: var(--white);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .card-body { padding: 1.25rem 1.5rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem; }

    .section-head {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
      background: color-mix(in srgb, var(--accent) 5%, transparent);
      display: flex; justify-content: space-between; align-items: baseline;
      flex-wrap: wrap; gap: 0.5rem;
    }
    .section-head h2 { margin: 0; font-size: 1.05rem; color: var(--heading-color); }
    .section-hint { font-size: 0.78rem; color: var(--text-muted); }

    /* Accordion sections */
    .accordion {
      background: var(--white);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .accordion > summary {
      padding: 1rem 1.5rem;
      background: color-mix(in srgb, var(--accent) 5%, transparent);
      cursor: pointer;
      list-style: none;
      display: flex; align-items: center; justify-content: space-between;
      user-select: none;
    }
    .accordion > summary::-webkit-details-marker { display: none; }
    .accordion > summary::after {
      content: '\\25BC';
      font-size: 0.7rem;
      color: var(--text-muted);
      transition: transform 0.2s ease;
    }
    .accordion[open] > summary::after { transform: rotate(180deg); }
    .accordion > summary h2 { margin: 0; font-size: 1.05rem; color: var(--heading-color); }

    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text); }
    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.55rem 0.8rem;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-light);
      background: var(--white); color: var(--text);
      font-size: 0.9rem; font-family: inherit;
      transition: border-color 0.2s ease;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none; border-color: var(--accent);
    }
    .form-group .invalid { border-color: #D95A5A; }
    .form-group textarea { resize: vertical; min-height: 80px; }

    .input-skeleton {
      height: 38px; border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--off-white) 25%, var(--border-light) 50%, var(--off-white) 75%);
      background-size: 200% 100%; animation: skeleton 1.4s infinite;
    }
    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .table-wrap { overflow-x: auto; }
    .data-table {
      width: 100%; border-collapse: collapse; font-size: 0.88rem;
    }
    .data-table th {
      background: var(--off-white);
      padding: 0.7rem 0.6rem;
      text-align: start;
      font-weight: 700; color: var(--heading-color);
      border-bottom: 1.5px solid var(--border-light);
      font-size: 0.82rem;
    }
    .data-table td {
      padding: 0.45rem 0.5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border-light) 70%, transparent);
      vertical-align: middle;
    }
    .data-table tr.has-error { background: color-mix(in srgb, #D95A5A 4%, transparent); }
    .data-table input[type="text"],
    .data-table select {
      width: 100%;
      padding: 0.4rem 0.55rem;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      font-size: 0.85rem;
      background: var(--white); color: var(--text);
    }
    .data-table select.err {
      border-color: #D9A05A;
      background: color-mix(in srgb, #D9A05A 6%, var(--white));
      color: #8A5A20; font-weight: 600;
    }

    .articulation-table .letter-col,
    .articulation-table .letter-cell {
      width: 60px; text-align: center;
    }
    .articulation-table .letter-cell {
      font-size: 1.5rem; font-weight: 700; color: var(--accent);
      font-family: 'Cairo', sans-serif;
    }
    .example {
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
      font-family: 'Cairo', sans-serif;
    }

    .grouped-table .group-row td {
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      color: var(--accent);
      font-weight: 700;
      padding: 0.55rem 0.75rem;
      font-size: 0.88rem;
    }
    .grouped-table .yesno-col { width: 70px; text-align: center; }
    .grouped-table .center { text-align: center; }
    .grouped-table .check-cell { font-weight: 600; color: var(--heading-color); padding-inline-start: 1.25rem; }

    .big-check { width: 20px; height: 20px; cursor: pointer; accent-color: var(--accent); }

    .counter-bar {
      display: flex; gap: 0.6rem; justify-content: flex-end;
      padding: 0.85rem 1.5rem; background: var(--off-white);
      border-top: 1px solid var(--border-light);
    }
    .counter-pill {
      padding: 0.35rem 0.8rem;
      border-radius: var(--radius-xl);
      background: color-mix(in srgb, #D9A05A 15%, transparent);
      color: #8A5A20; font-size: 0.82rem; font-weight: 600;
    }
    .counter-pill.ok {
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
    }

    .footer-actions {
      display: flex; gap: 0.6rem; justify-content: flex-end;
      padding: 1rem 0;
    }

    @media (max-width: 768px) {
      .grid-2 { grid-template-columns: 1fr; }
      .assess-header { flex-direction: column; align-items: stretch; }
      .header-actions { justify-content: stretch; }
      .header-actions .btn { flex: 1; }
      .articulation-table .letter-cell { font-size: 1.25rem; }
    }
  `,
})
export class SpeechAssessmentPage implements OnInit {
  private readonly therapist = inject(TherapistService);
  private readonly assessments = inject(AssessmentService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ts = inject(TranslationService);

  // Form state
  studentId = signal<string>('');
  evalDate = signal<string>(new Date().toISOString().slice(0, 10));
  generalNotes = signal<string>('');
  recommendations = signal<string>('');

  articulation = signal<ArticulationLetter[]>(
    ARABIC_LETTERS.map((letter) => ({
      letter,
      beginning: ArticulationError.None,
      middle: ArticulationError.None,
      end: ArticulationError.None,
      notes: '',
    })),
  );

  organs = signal<SpeechOrganItem[]>(
    ORGAN_DEF.map((o) => ({ ...o, normal: null as boolean | null, notes: '' })),
  );

  vocabulary = signal<VocabularyItem[]>(
    VOCAB_DEF.flatMap((g) =>
      g.words.map((word) => ({
        group: g.group,
        word,
        receptive: false,
        expressive: false,
        notes: '',
      })),
    ),
  );

  cognitive = signal<YesNoItem[]>(
    COGNITIVE_DEF.map((c) => ({ ...c, known: null as boolean | null, notes: '' })),
  );

  grammar = signal<GrammarItem[]>(
    GRAMMAR_DEF.map((g) => ({ ...g, receptive: false, expressive: false, notes: '' })),
  );

  dialogue = signal<DialogueItem[]>(
    DIALOGUE_DEF.map((q) => ({ question: q, response: '', notes: '' })),
  );

  perception = signal<YesNoItem[]>(
    PERCEPTION_DEF.map((p) => ({ ...p, known: null as boolean | null, notes: '' })),
  );

  // UI state
  loadingStudents = signal(true);
  students = signal<Student[]>([]);
  saving = signal(false);
  submitted = signal(false);
  savedNotice = signal<string | null>(null);

  errorOptions = ERROR_OPTIONS;

  totalErrors = computed(() =>
    this.articulation().reduce((sum, row) => {
      let n = 0;
      if (row.beginning !== ArticulationError.None) n++;
      if (row.middle !== ArticulationError.None) n++;
      if (row.end !== ArticulationError.None) n++;
      return sum + n;
    }, 0),
  );

  cleanLetters = computed(
    () =>
      this.articulation().filter(
        (r) =>
          r.beginning === ArticulationError.None &&
          r.middle === ArticulationError.None &&
          r.end === ArticulationError.None,
      ).length,
  );

  canSubmit = computed(() => this.studentId() !== '' && this.evalDate() !== '');

  ngOnInit(): void {
    this.therapist.getMyStudents().subscribe({
      next: (list) => {
        this.students.set(list);
        const queryStudent = this.route.snapshot.queryParamMap.get('studentId');
        if (queryStudent) this.studentId.set(queryStudent);
        this.loadingStudents.set(false);
      },
      error: () => this.loadingStudents.set(false),
    });
  }

  /** Inline translation helper for NEW labels (avoids touching ar.ts/en.ts). */
  t(key: string): string {
    const lang = (this.ts.currentLang?.() ?? 'ar') as 'ar' | 'en';
    const dict = T[lang] ?? T.ar;
    return dict[key] ?? T.ar[key] ?? key;
  }

  /** Example word for the articulation table. */
  example(letter: string, pos: 'beginning' | 'middle' | 'end'): string {
    return LETTER_EXAMPLES[letter]?.[pos] ?? '';
  }

  rowHasError(row: ArticulationLetter): boolean {
    return (
      row.beginning !== ArticulationError.None ||
      row.middle !== ArticulationError.None ||
      row.end !== ArticulationError.None
    );
  }

  // --- Grouping helpers (stable order, preserve definition sequence) ---
  private uniq(groups: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const g of groups) {
      if (!seen.has(g)) { seen.add(g); out.push(g); }
    }
    return out;
  }

  organGroups = computed(() => this.uniq(this.organs().map((o) => o.group)));
  organsByGroup(group: string): SpeechOrganItem[] {
    return this.organs().filter((o) => o.group === group);
  }

  vocabGroups = computed(() => this.uniq(this.vocabulary().map((v) => v.group)));
  vocabByGroup(group: string): VocabularyItem[] {
    return this.vocabulary().filter((v) => v.group === group);
  }

  cognitiveGroups = computed(() => this.uniq(this.cognitive().map((c) => c.group)));
  cognitiveByGroup(group: string): YesNoItem[] {
    return this.cognitive().filter((c) => c.group === group);
  }

  grammarGroups = computed(() => this.uniq(this.grammar().map((g) => g.group)));
  grammarByGroup(group: string): GrammarItem[] {
    return this.grammar().filter((g) => g.group === group);
  }

  perceptionGroups = computed(() => this.uniq(this.perception().map((p) => p.group)));
  perceptionByGroup(group: string): YesNoItem[] {
    return this.perception().filter((p) => p.group === group);
  }

  save(asDraft: boolean): void {
    this.submitted.set(true);
    if (!this.canSubmit()) return;

    this.saving.set(true);

    // Back-compat organs aggregate for existing API/data shape.
    const lipsItems = this.organs().filter((o) => o.group === 'sp_org_group_lips');
    const tongueItems = this.organs().filter((o) => o.group === 'sp_org_group_tongue');
    const teethItems = this.organs().filter((o) => o.group === 'sp_org_group_teeth');
    const breathingItems = this.organs().filter(
      (o) => o.group === 'sp_org_group_breathing_normal' || o.group === 'sp_org_group_breathing_speech',
    );

    const aggNormal = (items: SpeechOrganItem[]): boolean =>
      items.length === 0 || items.every((i) => i.normal !== false);
    const aggNotes = (items: SpeechOrganItem[]): string =>
      items.map((i) => (i.notes ?? '').trim()).filter(Boolean).join('; ');

    const organsLegacy: SpeechOrgansCheck = {
      lipsNormal: aggNormal(lipsItems),
      lipsNotes: aggNotes(lipsItems),
      tongueNormal: aggNormal(tongueItems),
      tongueNotes: aggNotes(tongueItems),
      teethNormal: aggNormal(teethItems),
      teethNotes: aggNotes(teethItems),
      palateNormal: true, // palate not captured in new PDF
      palateNotes: '',
      breathingExercises: breathingItems
        .filter((b) => b.normal !== null)
        .map((b) => `${this.t(b.label)}: ${b.normal ? this.t('sp_col_yes') : this.t('sp_col_no')}${b.notes ? ' — ' + b.notes : ''}`)
        .join('\n'),
    };

    // Back-compat receptive/expressive summary (per vocab group).
    const recExpSummary: ReceptiveExpressiveItem[] = this.vocabGroups().map((g) => {
      const items = this.vocabByGroup(g);
      return {
        category: g,
        receptive: items.some((i) => i.receptive),
        expressive: items.some((i) => i.expressive),
        notes: items.map((i) => i.notes ?? '').filter(Boolean).join('; '),
      };
    });

    const payload: SpeechAssessmentData = {
      articulation: this.articulation(),
      organs: organsLegacy,
      receptiveExpressive: recExpSummary,
      organItems: this.organs(),
      vocabulary: this.vocabulary(),
      cognitive: this.cognitive(),
      grammar: this.grammar(),
      dialogue: this.dialogue(),
      perception: this.perception(),
      generalNotes: this.generalNotes(),
      recommendations: this.recommendations(),
    };

    const student = this.students().find((s) => s.id === this.studentId());

    this.assessments
      .save({
        type: AssessmentType.Speech,
        studentId: this.studentId(),
        studentName: student?.fullName,
        evaluatorId: this.auth.getUserId() ?? '',
        evaluatorName: this.auth.getUserName() ?? '',
        date: this.evalDate(),
        status: asDraft ? AssessmentStatus.Draft : AssessmentStatus.Submitted,
        payload,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.savedNotice.set(
            asDraft ? this.ts.t('assess_saved_draft') : this.ts.t('assess_saved_submitted'),
          );
          setTimeout(() => this.savedNotice.set(null), 4000);
          if (!asDraft) {
            setTimeout(() => this.router.navigate(['/therapist/assessments']), 1200);
          }
        },
        error: () => {
          this.saving.set(false);
          this.savedNotice.set(this.ts.t('assess_save_error'));
        },
      });
  }
}
