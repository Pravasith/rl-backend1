const mongoose = require('mongoose')
const Schema = mongoose.Schema


// Create product schema and Model
const NewCategorySchema = new Schema({

    adminId: {
        type: String,
        required: [true, "The computer couldn't process the adminId."]
    },

    subCategoryId : {
        type: String,
        required: [true, "The computer couldn't process the categoryId."]
    },

    subCategoryName : {
        type: String,
        default: null,
    },

    productTypes : {
        type: Array,
        default: [],
    }
})

const BarrierFreeProducts = mongoose.model('barrier-free-product', NewCategorySchema)
const BathroomProducts = mongoose.model('bathroom-product', NewCategorySchema)
const CeilingProducts = mongoose.model('ceiling-product', NewCategorySchema)
const ConstructionSiteEquipmentProducts = mongoose.model('construction-site-equipment-product', NewCategorySchema)
const DecorProducts = mongoose.model('decor-product', NewCategorySchema)
const DoorsProducts = mongoose.model('door-product', NewCategorySchema)
const ElectricalsProducts = mongoose.model('electrical-product', NewCategorySchema)
const ExternalWallsAndFacadesProducts = mongoose.model('external-walls-and-facade-product', NewCategorySchema)
const FencesAndPerimeterEnclosuresProducts = mongoose.model('fences-and-perimeter-closure-product', NewCategorySchema)
const FinishesProducts = mongoose.model('finishing-product', NewCategorySchema)
const FirePreventionAndSafetyProducts = mongoose.model('fire-prevention-and-safety-product', NewCategorySchema)
const FloorsAndWallInstallationsProducts = mongoose.model('floors-and-wall-installation-product', NewCategorySchema)
const FurnitureProducts = mongoose.model('furniture-product', NewCategorySchema)
const HardwareAndFastenersProducts = mongoose.model('hardware-and-fastener-product', NewCategorySchema)
const HeatingVentilationAndAirConditioningProducts = mongoose.model('heating-ventilation-and-air-conditioning-product', NewCategorySchema)
const HomeAutomationProducts = mongoose.model('home-automation-product', NewCategorySchema)
const InsulationProducts = mongoose.model('insulation-product', NewCategorySchema)
const KitchenProducts = mongoose.model('kitchen-product', NewCategorySchema)
const LiftsAndEscalatorsProducts = mongoose.model('lifts-and-escalators-product', NewCategorySchema)
const LightingProducts = mongoose.model('lighting-product', NewCategorySchema)
const OfficeProducts = mongoose.model('office-product', NewCategorySchema)
const OutdoorProducts = mongoose.model('outdoor-product', NewCategorySchema)
const PartitionsProducts = mongoose.model('partition-product', NewCategorySchema)
const PlumbingProducts = mongoose.model('plumbing-product', NewCategorySchema)
const RenewableEnergySystemProducts = mongoose.model('renewable-energy-systems-product', NewCategorySchema)
const RoofProducts = mongoose.model('roofing-product', NewCategorySchema)
const SafetyAndSecurityProducts = mongoose.model('safety-and-security-product', NewCategorySchema)
const StairProducts = mongoose.model('stairs-product', NewCategorySchema)
const WaterproofingProducts = mongoose.model('waterproofing-product', NewCategorySchema)
const WaterSystemProducts = mongoose.model('water-system-product', NewCategorySchema)
const WellnessProducts = mongoose.model('wellness-product', NewCategorySchema)
const WindowProducts = mongoose.model('windows-product', NewCategorySchema)
const WoodProducts = mongoose.model('wood-product', NewCategorySchema)

module.exports = {
    BarrierFreeProducts,
    BathroomProducts,
    CeilingProducts,
    ConstructionSiteEquipmentProducts,
    DecorProducts,
    DoorsProducts,
    ElectricalsProducts,
    ExternalWallsAndFacadesProducts,
    FencesAndPerimeterEnclosuresProducts,
    FinishesProducts,
    FirePreventionAndSafetyProducts,
    FloorsAndWallInstallationsProducts,
    FurnitureProducts,
    HardwareAndFastenersProducts,
    HeatingVentilationAndAirConditioningProducts,
    HomeAutomationProducts,
    InsulationProducts,
    KitchenProducts,
    LiftsAndEscalatorsProducts,
    LightingProducts,
    OfficeProducts,
    OutdoorProducts,
    PartitionsProducts,
    PlumbingProducts,
    RenewableEnergySystemProducts,
    RoofProducts,
    SafetyAndSecurityProducts,
    StairProducts,
    WaterproofingProducts,
    WaterSystemProducts,
    WellnessProducts,
    WindowProducts,
    WoodProducts,
}