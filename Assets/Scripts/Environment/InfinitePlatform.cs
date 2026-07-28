using UnityEngine;

public class InfinitePlatform : MonoBehaviour
{
    [SerializeField] float tileLength = 10f;
    [SerializeField] int tileCount = 5;
    [SerializeField] Material platformMaterial;

    Transform[] tiles;
    float recycleZ;

    void Start()
    {
        tiles = new Transform[tileCount];
        for (int i = 0; i < tileCount; i++)
        {
            GameObject tile = GameObject.CreatePrimitive(PrimitiveType.Cube);
            tile.name = "Platform_" + i;
            tile.transform.SetParent(transform);
            tile.transform.localScale = new Vector3(3f, 0.5f, tileLength);
            tile.transform.position = new Vector3(0f, -0.25f, i * tileLength);
            Renderer r = tile.GetComponent<Renderer>();
            if (platformMaterial != null)
                r.sharedMaterial = platformMaterial;
            else
                r.sharedMaterial.color = new Color(0.76f, 0.6f, 0.42f);
            tile.tag = "Ground";
            tiles[i] = tile.transform;
        }
        recycleZ = -tileLength;
    }

    void Update()
    {
        if (GameManager.Instance == null) return;
        if (GameManager.Instance.state != GameState.Playing) return;

        float camZ = Camera.main.transform.position.z;
        float limit = camZ + recycleZ;

        for (int i = 0; i < tiles.Length; i++)
        {
            if (tiles[i].position.z < limit)
            {
                float furthestZ = float.MinValue;
                for (int j = 0; j < tiles.Length; j++)
                {
                    if (tiles[j].position.z > furthestZ)
                        furthestZ = tiles[j].position.z;
                }
                tiles[i].position = new Vector3(0f, tiles[i].position.y, furthestZ + tileLength);
            }
        }
    }
}
