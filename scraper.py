import json
import os

# Esto es lo que se guardará en tu archivo de canales
# En el futuro, aquí pondremos la lógica para extraer el link de la web
def actualizar():
    data = {
        "principal": "TU_NUEVO_ENLACE_AQUI",
        "respaldo": "TU_ENLACE_RESPALDO_AQUI"
    }
    with open('canales.json', 'w') as f:
        json.dump(data, f)
    
    print("Enlace actualizado localmente. Subiendo a GitHub...")
    os.system('./push.sh')

if __name__ == "__main__":
    actualizar()
