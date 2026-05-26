import Area from '../models/area.model.js';

export const registrarArea = async (req,res)=>{
    try{
     const{codigo,nombre,gerencia}=req.body
     const nuevaArea=await Area.create({
        codigo,nombre,gerencia
     })
     res.status(201).json({
        message:"Se registro el Area",
        area:nuevaArea
     })

     }catch(error){
        console.log(error)
    }
}

export const listarArea = async (req,res)=>{
    try{
     
     const listadeArea=await Area.findAll();
     res.status(201).json({
        message:"Se registro el Area",
        area:listadeArea
     })

     }catch(error){
        console.log(error)
     }
}

export const actualizarArea = async (req,res)=>{
    try{
     const { id } = req.params;
     const{codigo,nombre,gerencia}=req.body
     const nuevaArea=await Area.findByPk(id);

   if(!nuevaArea){
      return res.status(404).json({
        message:"No se encontro ninguna area",
     })
   }
     await area.update({
        codigo,
        nombre,
        gerencia
   });


     res.status(201).json({
        message:"Se actualizo el Area",
        area:nuevaArea
     })

     }catch(error){
        console.log(error)
     }
}

export const eliminarArea = async (req,res)=>{
    try{
     const { id } = req.params;
     const nuevaArea=await Area.findByPk(id);

     if(!nuevaArea){
      return res.status(404).json({
        message:"No se encontro el area",
     })
   }

     await area.destroy();

     res.status(201).json({
        message:"Se elimino el Area",
        area:nuevaArea
     })

     }catch(error){
        console.log(error)
     }
}