import { BotanicalVegetable } from "../Topology/Figures/ObjectTypes";

const BotanicalCompose = {
    CreateBotanicalVegetable: async (index: string): Promise<BotanicalVegetable | null> => {
        if (index == '0x0000') {
            return {
                nameCommon: "Swiss Chrard",
                nameGeneric: "Not found",
                nameSpecificEpithet: "Not found"
            }
        }

        return null;
    }
}

export default BotanicalCompose;