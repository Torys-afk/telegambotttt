using UnityEngine;
using UnityEditor;

public class SetupSceneSetup
{
    [MenuItem("Bikini Bottom Runner/Sahne Olustur")]
    public static void CreateScene()
    {
        if (GameObject.Find("_Game") != null)
            DestroyImmediate(GameObject.Find("_Game"));

        GameObject root = new GameObject("_Game");

        GameObject managers = new GameObject("Managers");
        managers.transform.SetParent(root.transform);
        managers.AddComponent<GameManager>();
        managers.AddComponent<ScoreManager>();

        GameObject player = GameObject.CreatePrimitive(PrimitiveType.Cube);
        player.name = "Player";
        player.tag = "Player";
        player.transform.SetParent(root.transform);
        player.transform.position = new Vector3(0f, 0.6f, 0f);
        player.transform.localScale = new Vector3(0.7f, 1.2f, 0.7f);
        player.GetComponent<Renderer>().sharedMaterial.color = Color.yellow;
        Rigidbody rb = player.AddComponent<Rigidbody>();
        rb.constraints = RigidbodyConstraints.FreezeRotation;
        rb.mass = 1f;
        BoxCollider col = player.AddComponent<BoxCollider>();
        col.size = new Vector3(0.7f, 1.2f, 0.7f);
        col.center = new Vector3(0f, 0.6f, 0f);
        player.AddComponent<Player>();

        Material groundMat = new Material(Shader.Find("Standard"));
        groundMat.color = new Color(0.76f, 0.6f, 0.42f);

        GameObject ground = new GameObject("Ground");
        ground.tag = "Ground";
        ground.transform.SetParent(root.transform);
        InfinitePlatform ip = ground.AddComponent<InfinitePlatform>();
        ip.platformMaterial = groundMat;

        GameObject obstaclePrefab = CreateObstaclePrefab("Kizilot", PrimitiveType.Cube, new Color(1f, 0.3f, 0.3f));
        GameObject obstaclePrefab2 = CreateObstaclePrefab("Capa", PrimitiveType.Cylinder, new Color(0.6f, 0.6f, 0.8f));

        GameObject coinPrefab = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        coinPrefab.name = "CoinPrefab";
        coinPrefab.tag = "Coin";
        coinPrefab.transform.localScale = new Vector3(0.3f, 0.3f, 0.3f);
        coinPrefab.GetComponent<Renderer>().sharedMaterial.color = Color.yellow;
        coinPrefab.GetComponent<Collider>().isTrigger = true;
        coinPrefab.AddComponent<CoinPickup>();
        coinPrefab.SetActive(false);

        GameObject spawnerObj = new GameObject("Spawner");
        spawnerObj.transform.SetParent(root.transform);
        Spawner spawner = spawnerObj.AddComponent<Spawner>();
        spawner.obstaclePrefab = obstaclePrefab;
        spawner.obstaclePrefab2 = obstaclePrefab2;
        spawner.coinPrefab = coinPrefab;

        GameObject chaser = GameObject.CreatePrimitive(PrimitiveType.Cube);
        chaser.name = "Plankton";
        chaser.transform.SetParent(root.transform);
        chaser.transform.position = new Vector3(0f, 0.8f, -15f);
        chaser.transform.localScale = new Vector3(0.6f, 0.9f, 0.6f);
        chaser.GetComponent<Renderer>().sharedMaterial.color = Color.green;
        chaser.AddComponent<Chaser>();

        GameObject camObj = new GameObject("MainCamera");
        camObj.tag = "MainCamera";
        camObj.transform.SetParent(root.transform);
        camObj.transform.position = new Vector3(0f, 5f, -6f);
        Camera cam = camObj.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(0.3f, 0.6f, 0.9f);
        cam.fieldOfView = 70f;
        cam.nearClipPlane = 0.1f;
        cam.farClipPlane = 200f;
        camObj.AddComponent<AudioListener>();
        camObj.AddComponent<CameraFollow>();

        GameObject uiObj = new GameObject("UI");
        uiObj.transform.SetParent(root.transform);
        uiObj.AddComponent<UIManager>();

        Selection.activeGameObject = root;
        EditorUtility.DisplayDialog("Hazir!", "Sahne olusturuldu! Play'e bas.", "Tamam");
    }

    static GameObject CreateObstaclePrefab(string name, PrimitiveType type, Color color)
    {
        GameObject obj = GameObject.CreatePrimitive(type);
        obj.name = name;
        obj.tag = "Obstacle";
        obj.transform.localScale = new Vector3(0.8f, 0.8f, 0.8f);
        obj.GetComponent<Renderer>().sharedMaterial.color = color;
        Collider existing = obj.GetComponent<Collider>();
        if (existing != null) Object.DestroyImmediate(existing);
        BoxCollider c = obj.AddComponent<BoxCollider>();
        c.isTrigger = true;
        c.size = Vector3.one;
        obj.AddComponent<Obstacle>();
        obj.SetActive(false);
        return obj;
    }
}
